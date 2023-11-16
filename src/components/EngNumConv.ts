/*
 * EngNumConv
 *
 * Converts an exponent number to an English name
 *
 * Author: Tsuteto
 * Licensed under MIT
 */
interface NumberSystem {
  calcIllion(th: bigint, suffix: IllionSuffix): IllionRootBuilder;
}

export enum Scale {
  SHORT, LONG
}

export type ScaleInfo = {
  range: number;
  toIllionth: (exp: bigint) => bigint
  toExp: (illionth: bigint) => bigint
}

export type Options = {
  scale: Scale;
  longScaleStyle: LongScaleStyle;
  system: "DIC" | "JB";
}

export type ExOptions = {
  scale?: Scale;
  longScaleStyle?: LongScaleStyle;
  system?: "DIC" | "JB";
}

type InputDetail = {
  // coefficient
  coef: string;
  // exponent
  exp: string;
}

type InputTier3 = {
  // exponent
  exp2: string;
}

type InputTier4 = {
  // exponent
  exp3: string;
}

export type Input  = InputDetail | InputTier3 | InputTier4;

type Unit = {
  basic: string;
  combo?: string;
  flags: string;
}

export const SCALES: { [key: number]: ScaleInfo } = {};
SCALES[Scale.SHORT] = {
  range: 3,
  toIllionth: (exp: bigint) => (exp - 3n) / 3n,
  toExp: (illionth: bigint) => illionth === 0n ? 0n : illionth * 3n + 3n
};
SCALES[Scale.LONG] = {
  range: 6,
  toIllionth: (exp: bigint) => exp / 6n,
  toExp: (illionth: bigint) => illionth * 6n
};

export enum LongScaleStyle {
  BRITISH, EUROPEAN
}

export type ResultData = (NumberPart | Illion | Comma)[];

export enum ResultFormat {
  PLAIN, SOFT_HYPHENS, HYPHENS
};

export const IllionType = {
  NUMBER: "n",
  PART: "p",
  WORD: "w",
  SUFFIX: "s",
  COMMA: "c"
} as const;
type IllionType = typeof IllionType[keyof typeof IllionType];

export type NumberPart = {
  digits: string;
  words: string;
  type: "n";
}

export type Comma = {
  words: string;
  type: "c";
}

export type Illion = IllionPart | IllionSuffix;
export type IllionNode = IllionPart | IllionWord;

export type IllionPart = {
  parts: IllionNode[];
  tier: number;
  type: "p";
}

export type IllionWord = {
  word: string;
  ordinal: number;
  greedy?: boolean;
  type: "w";
}

export type IllionSuffix = {
  word: string;
  type: "s";
}

class IllionRootBuilder {
  nodes: Illion[] = [];

  appendNewPart(tier: number) {
    return this.insertNewPart(tier, true);
  }

  prependNewPart(tier: number) {
    return this.insertNewPart(tier, false);
  }

  insertNewPart(tier: number, append: boolean) {
    const newPart = {parts: [], tier: tier, type: IllionType.PART};
    if (append) {
      this.nodes.push(newPart);
    } else {
      this.nodes.unshift(newPart);
    }
    return new IllionPartBuilder(newPart);
  }

  push(part: Illion) {
    this.nodes.push(part);
  }

  unshift(part: Illion) {
    this.nodes.unshift(part);
  }

  pushSuffix(orgSuffix: IllionSuffix) {
    const suffix = {word: orgSuffix.word, type: orgSuffix.type};
    const parts = this.nodes.filter(p => p.type === IllionType.PART) as IllionPart[];
    if (!parts.length) return;
    const lastWord = new IllionPartBuilder(parts.slice(-1)[0]).getLastWord();
    if (!lastWord) return;

    if (!lastWord.greedy && /(n|c)t.$/.test(lastWord.word)) {
      // Yield t to the illion
      lastWord.word = lastWord.word.slice(0, -2);
      suffix.word = "t" + suffix.word;
    } else if (!lastWord.greedy && /i$/.test(lastWord.word)) {
      // Yield i to the illion
      lastWord.word = lastWord.word.slice(0, -1);
    } else if (/i$/.test(lastWord.word)) {
      // Grab i from the illion
      suffix.word = suffix.word.slice(1);
    } else {
      lastWord.word = lastWord.word.slice(0, -1);
    }
    this.push(suffix);
  }

}

class IllionPartBuilder {
  node: IllionPart;

  constructor(arg: IllionPart | number) {
    if (typeof arg === "object" && arg.type === IllionType.PART) {
      this.node = arg;
    } else if (typeof arg === "number") {
      this.node = {parts: [], tier: arg, type: IllionType.PART};
    } else {
      throw new Error("Incompatible type of arguments");
    }
  }

  appendNewPart(tier: number) {
    return this.insertNewPart(tier, true);
  }

  prependNewPart(tier: number) {
    return this.insertNewPart(tier, false);
  }

  insertNewPart(tier: number, append: boolean) {
    const upperTier = {parts: [], tier: tier, type: IllionType.PART};
    if (append) {
      this.node.parts.push(upperTier);
    } else {
      this.node.parts.unshift(upperTier);
    }
    return new IllionPartBuilder(upperTier);
  }  

  pushWord(word: string | null, ordinal: number, greedy?: boolean) {
    if (word) {
      this.node.parts.push({word: word, ordinal: ordinal, greedy: greedy, type: IllionType.WORD});
    }
  }

  unshiftWord(word: string | null, ordinal: number, greedy?: boolean) {
    if (word) {
      this.node.parts.unshift({word: word, ordinal: ordinal, greedy: greedy, type: IllionType.WORD});
    }
  }

  getLastWord(): IllionWord | undefined {
    const lastNode = this.node.parts.slice(-1)[0];
    if (lastNode) {
      if (lastNode.type === IllionType.PART) {
        return new IllionPartBuilder(lastNode).getLastWord();
      } else if (lastNode.type === IllionType.WORD) {
        return lastNode;
      }
    }
  }

  replaceLastCharWith(char: string) {
    const lastNode = this.getLastWord();
    if (lastNode) {
      lastNode.word = lastNode.word.slice(0, -1) + char;
    }
  }
}

type IllionBuilder = IllionRootBuilder | IllionPartBuilder;

class DicSystem implements NumberSystem {
  static UNITS = [
    { basic: "ni", combo: "", flags: "", greedy: true },
    { basic: "mi", combo: "un", alter: "uni", flags: "" },
    { basic: "bi", combo: "duo", alter: "du", flags: "" },
    { basic: "tri", combo: "tre", flags: "*" },
    { basic: "quadri", combo: "quattuor", flags: "" },
    { basic: "quinti", combo: "quin", flags: "" },
    { basic: "sexti", combo: "se", flags: "sx" },
    { basic: "septi", combo: "septe", flags: "mn" },
    { basic: "octi", combo: "octo", flags: "" },
    { basic: "noni", combo: "nove", flags: "mn" },
  ];

  static TENS = [
    null,
    { basic: "deci", flags: "n" },
    { basic: "viginti", flags: "ms" },
    { basic: "triginta", flags: "ns" },
    { basic: "quadraginta", flags: "ns" },
    { basic: "quinquaginta", flags: "ns" },
    { basic: "sexaginta", flags: "n" },
    { basic: "septuaginta", flags: "n" },
    { basic: "octoginta", flags: "mx" },
    { basic: "nonaginta", flags: "" },
  ];

  static HUNDREDS = [
    null,
    { basic: "centi", flags: "nx" },
    { basic: "ducenti", flags: "ms" },
    { basic: "trecenti", flags: "ns" },
    { basic: "quadringenti", flags: "ns" },
    { basic: "quingenti", flags: "ns" },
    { basic: "sescenti", flags: "n" },
    { basic: "septingenti", flags: "n" },
    { basic: "octingenti", flags: "mx" },
    { basic: "nongenti", flags: "" },
  ];

  calcIllion(th: bigint, suffix: IllionSuffix) {
    let thousandthPow = 0n;
    const illion = new IllionRootBuilder();
    while (th > 0) {
      const part = Number(th % 1000n);
      const isEnd = thousandthPow === 0n;
      const illionPart = illion.prependNewPart(1);
      this.calcTier1(illionPart, part, isEnd, th > 1000n);
      this.calcTier2(illionPart, thousandthPow);
      th /= 1000n;
      thousandthPow++;
    }
    if (illion.nodes.length > 0) {
      illion.pushSuffix(suffix);
    }
    return illion;
  }

  calcIllionTier2(exp2: bigint, suffix: IllionSuffix): IllionRootBuilder {
    throw new Error("Not Implemented");
  }

  calcIllionTier3(exp3: bigint, suffix: IllionSuffix): IllionRootBuilder {
    throw new Error("Not Implemented");
  }

  calcTier2(part: IllionPartBuilder, order: bigint, isSingle?: boolean) {
    const lastWord = part.getLastWord();
    if (order > 0n && lastWord) {
      let illi = "illi";
      if (!lastWord.greedy && /(n|c)t.$/.test(lastWord.word)) {
        // Yield t to the -illi-
        lastWord.word = lastWord.word.slice(0, -2);
        illi = "tilli";
      } else if (!lastWord.greedy && /i$/.test(lastWord.word)) {
        // Yield i to the -illi-
        lastWord.word = lastWord.word.slice(0, -1);
      } else if (/i$/.test(lastWord.word)) {
        // Grab i from the -illi-
        illi = "lli";
      } else {
        lastWord.word = lastWord.word.slice(0, -1);
      }
      part.appendNewPart(2).pushWord(illi, 1);
    }
  }

  calcTier1(parent: IllionBuilder, th: number, isEnd: boolean, somethingOntoUpper: boolean) {
    const digitUnit = th % 10;
    const digitTen = th % 100 / 10 | 0;
    const digitHundred = th / 100 | 0;

    const unit = DicSystem.UNITS[digitUnit];
    const ten = DicSystem.TENS[digitTen];
    const hundred = DicSystem.HUNDREDS[digitHundred];

    const tier1 = parent.appendNewPart(1);

    // Units
    let name;
    if (!ten && !hundred) {
      name = somethingOntoUpper ? unit.alter ?? unit.basic : unit.basic;
    } else {
      name = this.conbineUnitName(unit, ten, hundred);
    }
    tier1.pushWord(name, digitUnit, true);

    // Tens
    if (ten) {
      const name = ten.basic;
      tier1.pushWord(name, digitTen * 10, false);
    }

    // Hundreds
    if (hundred) {
      tier1.pushWord(hundred.basic, digitHundred * 100, false);
    }

  }

  conbineUnitName(unit: Unit, ten: Unit | null, hundred: Unit | null) {
    const nextFlag = ten ? ten.flags : hundred ? hundred.flags : "";
    const suffix = unit.flags.split("")
      .reduce((s, f) => s += nextFlag.indexOf(f) > -1 ? f : f === "*" && /[sx]/.test(nextFlag) ? "s" : "", "");
    return unit.combo + suffix;
  }
}

class JBSystem extends DicSystem {
  static THOUSANDS = [
    null, null, "du", "tri", "quadri", "quinti", "sexti", "septi", "octi", "noni"
  ];

  static TIER2_SINGLE = [null, "milli", "micro", "nano", "pico", "femto", "atto", "zepto", "yocto", "xono"];

  static TIER2_UNITS = {
    base: [null, "me", "due", "trio", "tetre", "pente", "hexe", "hepte", "octe", "enne"],
    alter: [null, "m", "du", "tr", "tetr", "pent", "hex", "hept", "oct", "enn"]
  };

  static TIER2_TEENS = {
    base: ["veco", "meco", "dueco", "treco", "tetreco", "penteco", "hexeco", "hepteco", "octeco", "enneco"],
    alter: ["vece", "mece", "duece", "trece", "tetrece", "pentece", "hexece", "heptece", "octece", "ennece"],
  }

  static TIER2_TENS = {
    base: [null, "eco", "icoso", "triaconto", "tetraconto", "pentaconto", "hexaconto", "heptaconto", "octaconto", "enneaconto"],
    alter: [null, "vece", "icose", "triaconte", "tetraconte", "pentaconte", "hexaconte", "heptaconte", "octaconte", "enneaconte"],
  }

  static TIER2_HUNDREDS = {
    base: [null, "hecto", "dohecto", "triahecto", "tetrahecto", "pentahecto", "hexahecto", "heptahecto", "octahecto", "enneahecto"],
    alter: [null, "hecte", "dohecte", "triahecte", "tetrahecte", "pentahecte", "hexahecte", "heptahecte", "octahecte", "enneahecte"]
  }

  static TIER3_KILLA_UNITS = {
    base: [null, null, "micre", "nane", "pice", "femte", "atte", "zepte", "yocte", "xone"],
  }

  static TIER3_KILLA_TEENS = {
    base: [null, "killa", "mega", "giga", "tera", "peta", "exa", "zetta", "yotta", "ronna",
      "quetta", "henda", "doka", "tradaka", "tedaka", "pedaka", "exdaka", "zedaka", "yodaka", "nedaka"],
    alter: [null, "ena", "oda", "tra", "tera", "peta", "exa", "zetta", "yotta", "ronna",
      "quetta", "henda", "doka", "tradaka", "tedaka", "pedaka", "exdaka", "zedaka", "yodaka", "nedaka"]
  }

  static TIER3_DAKA_HUNDRED_TEENS = ["ta", "tena", "toda", "tra", "tera", "peta", "tecta", "zeta", "yota", "xena",
    "daka", "tenda", "doka", "tradaka", "tedaka", "pedaka", "exdaka", "zedaka", "yodaka", "nedaka"];

  static TIER3_DAKA_UNITS = {
    base: ["ka", "kena", "coda", "ctri", "ctera", "kpeta", "kexa", "czeta", "kyota", "cxena"],
    alter: ["ka", "ena", "oda", "tra", "tera", "peta", "exa", "zeta", "yota", "xena"],
    alter2: ["k", "ken", "cod", "ctr", "cter", "kpet", "kex", "czet", "kyot", "cxen"],
  }
  static TIER3_DAKA_TENS = {
    base: [null, "da", "i", "tra", "te", "pe", "exa", "za", "yo", "ne"],
    alter: [null, "da", "ti", "tra", "te", "pe", "exa", "za", "yo", "ne"]
  }
  static TIER3_DAKA_HUNDREDS = {
    base: [null, "hot", "dot", "tot", "trot", "pot", "exot", "zot", "yoot", "not"],
    alter: [null, "ho", "do", "to", "tro", "po", "exo", "zo", "yoo", "no"]
  }

  static TIER4_SINGLES = {
    base: [null, "kala", "meja", "gija", "asta", "luna", "ferma", "jova", "sola", "beta",
      "gaxa", "gloca", "supa", "versa", "multa"],
    alter: [null, "kal", "mej", "gij", "ast", "lun", "ferm", "jov", "sol", "bet",
      "gax", "gloc", "sup", "vers", "mult"]
  }

  static TIER4_UNITS = {
    base: [null, null, "d", "t", "tr", "p", "ex", "z", "y", "n"],
    alter: ["k", "ken", "cod", "ctr", "cter", "kpet", "kex", "czet", "kyot", "cxen"],
    alter2: [null, "ken", "cod", "ctr", "cter", "kpet", "kex", "czet", "kyot", "cxen"],
  }

  static TIER4_TEENS = {
    base: ["dak", "hend", "dok", "tradak", "tedak", "pedak", "exdak", "zedak", "yodak", "nedak"]
  }

  static TIER4_TENS = JBSystem.TIER3_DAKA_TENS;
  static TIER4_HUNDREDS = JBSystem.TIER3_DAKA_HUNDREDS;

  calcIllion(th: bigint, suffix: IllionSuffix) {
    let thousandthPow = 0n;
    let killoFlag = false;
    const illion = new IllionRootBuilder();
    while (th > 0) {
      const part = Number(th % 1000n);
      if (part) {
        if (!killoFlag && thousandthPow < 1000n) {
          killoFlag = true;
        }
        if (thousandthPow >= 1000n && thousandthPow % 1000n === 0n && part > 1) {
          killoFlag = false;
        }
        const illionPart = illion.prependNewPart(1);
        this.calcTier1(illionPart, part, thousandthPow === 0n, th > 1000n);
        this.calcTier2(illionPart, thousandthPow, killoFlag);
      }
      th /= 1000n;
      thousandthPow++;
    }
    if (illion.nodes.length > 0) {
      illion.pushSuffix(suffix);
    }
    return illion;
  }

  calcIllionTier2(exp2: bigint, suffix: IllionSuffix) {
    let thousandthPow = exp2 / 3n;
    let part = Number(10n ** (exp2 % 3n));
    const illion = new IllionRootBuilder();
    const illionPart = illion.prependNewPart(1);
    this.calcTier1(illionPart, part, false, true);
    this.calcTier2(illionPart, thousandthPow);
    if (illion.nodes.length) {
      illion.pushSuffix(suffix);
    }
    return illion;
  }

  calcIllionTier3(exp3: bigint, suffix: IllionSuffix) {
    let thousandthPow = exp3 / 3n;
    let part = 10n ** (exp3 % 3n);
    const illion = new IllionRootBuilder();
    this.calcTier3(illion, thousandthPow);
    if (thousandthPow === 0n || part !== 1n) {
      this.calcTier2(illion, part);
    }
    illion.pushSuffix(suffix);
    return illion;
  }

  calcTier1(parent: IllionBuilder, th: number, isEnd: boolean, somethingOntoUpper: boolean) {
    const digitUnit = th % 10;
    const digitTen = th % 100 / 10 | 0;
    const digitHundred = th / 100 | 0;

    const unit = JBSystem.UNITS[digitUnit];
    const thousand = JBSystem.THOUSANDS[digitUnit];
    const ten = JBSystem.TENS[digitTen];
    const hundred = JBSystem.HUNDREDS[digitHundred];

    const part = parent as IllionPartBuilder;

    // Units
    if (digitUnit > 0) {
      let name;
      if (!ten && !hundred) {
        if (isEnd) {
          name = (somethingOntoUpper ? unit.alter ?? unit.basic : unit.basic);
        } else if (thousand) {
          name = thousand;
        } else {
          name = null;
        }
      } else {
        name = this.conbineUnitName(unit, ten, hundred);
      }
      part.pushWord(name, digitUnit, true);
    }

    // Tens
    if (ten) {
      part.pushWord(ten.basic, digitTen * 10, false);
    }

    // Hundreds
    if (hundred) {
      part.pushWord(hundred.basic, digitHundred * 100, false);
    }
  }

  calcTier2(parent: IllionBuilder, order: bigint, killoFlag?: boolean) {
    if (order === 0n) {
      return;
    }

    let thousandthPow = 0;
    while (order > 0) {
      const lower3 = Number(order % 1000n);
      if (lower3) {
        const ordUnit = lower3 % 10;
        const ordTeen = lower3 % 100 - 10;
        const ordTen = lower3 / 10 % 10 | 0;
        const ordHundred = lower3 / 100 | 0;
        if (!thousandthPow) {
          const part = parent.appendNewPart(2);
          killoFlag = false;
          if (lower3 < 10) {
            const t = JBSystem.TIER2_SINGLE[lower3];
            part.pushWord(t, lower3);
          } else if (lower3 < 20) {
            part.pushWord(JBSystem.TIER2_TEENS.base[ordTeen], ordTeen + 10);
          } else if (lower3 < 100) {
            part.pushWord(JBSystem.TIER2_UNITS.base[ordUnit], ordUnit);
            part.pushWord(JBSystem.TIER2_TENS.base[ordTen], ordTen * 10);
          } else {
            part.pushWord(JBSystem.TIER2_UNITS.base[ordUnit], ordUnit);
            part.pushWord(JBSystem.TIER2_TENS.alter[ordTen], ordTen * 10);
            part.pushWord(JBSystem.TIER2_HUNDREDS.base[ordHundred], ordHundred * 100);
          }
        } else {
          const part = parent.prependNewPart(2);
          if (lower3 < 10) {
            part.pushWord(JBSystem.TIER3_KILLA_UNITS.base[lower3], lower3);
          } else if (lower3 < 20) {
            part.pushWord(JBSystem.TIER2_TEENS.alter[ordTeen], ordTeen + 10);
          } else {
            part.pushWord(JBSystem.TIER2_UNITS.base[ordUnit], ordUnit);
            part.pushWord(JBSystem.TIER2_TENS.alter[ordTen], ordTen * 10);
            part.pushWord(JBSystem.TIER2_HUNDREDS.alter[ordHundred], ordHundred * 100);
          }
          this.calcTier3(part, BigInt(thousandthPow), killoFlag);
        }
      }
      order /= 1000n;
      thousandthPow++;
    }
  }

  calcTier3(parent: IllionBuilder, th: bigint, killoFlag?: boolean) {
    const lower3 = Number(th % 1000n);
    const du = lower3 % 10;
    const dt = lower3 / 10 % 10 | 0;
    const dh = lower3 / 100 % 10 | 0;
    const part = parent.appendNewPart(3);
    if (lower3) {
      if (lower3 < 20) {
        part.pushWord((th < 1000 ? JBSystem.TIER3_KILLA_TEENS.base : JBSystem.TIER3_KILLA_TEENS.alter)[lower3], lower3);
      } else if (lower3 < 100) {
        part.pushWord(JBSystem.TIER3_DAKA_TENS.base[dt], dt * 10);
        part.pushWord(JBSystem.TIER3_DAKA_UNITS.base[du], du);
      } else {
        const dtu = lower3 % 100;
        if (dtu < 20) {
          part.pushWord(JBSystem.TIER3_DAKA_HUNDREDS.alter[dh], dh * 100);
          part.pushWord(JBSystem.TIER3_DAKA_HUNDRED_TEENS[dtu], dtu);
        } else {
          const unit = JBSystem.TIER3_DAKA_UNITS.base[du];
          const ten = JBSystem.TIER3_DAKA_TENS.alter[dt];
          let hundred = JBSystem.TIER3_DAKA_HUNDREDS.alter[dh];
          if (hundred && `${hundred}${ten}`.indexOf("tt") > -1) {
            hundred = hundred.slice(0, -1);
          }
          part.pushWord(hundred, dh * 100);
          part.pushWord(ten, dt * 10);
          part.pushWord(unit, du);
        }
      }
      if (killoFlag) {
        part.replaceLastCharWith("o");
      }
    }
    
    this.calcTier4(part, th / 1000n, !!part.node.parts.length);
  }

  calcTier4(tier3: IllionPartBuilder, th: bigint, isSingle: boolean) {
    let thousandthPow = 1;
    while (th > 0) {
      const lower3 = Number(th % 1000n);
      if (lower3) {
        const kali = (isSingle ? JBSystem.TIER4_SINGLES.alter : JBSystem.TIER4_SINGLES.base)[thousandthPow];
        if (kali) {
          const tier4 = tier3.prependNewPart(4);
          tier4.pushWord(lower3 > 1 ? kali.slice(1) : kali, thousandthPow);
        }
        const du = lower3 % 10;
        const dt = (lower3 / 10 | 0) % 10;
        const dh = lower3 / 100 | 0;
        if (lower3 < 10) {
          tier3.unshiftWord(JBSystem.TIER4_UNITS.base[lower3], lower3);
        } else if (lower3 < 20) {
          const dtu = lower3 % 100 - 10;
          tier3.unshiftWord(JBSystem.TIER4_TEENS.base[dtu], dtu);
        } else if (lower3 < 100) {
          tier3.unshiftWord(JBSystem.TIER3_DAKA_UNITS.alter2[du], du);
          tier3.unshiftWord(JBSystem.TIER3_DAKA_TENS.base[dt], dt * 10);
        } else {
          const unit = JBSystem.TIER4_UNITS.alter2[du];
          const ten = JBSystem.TIER4_TENS.alter[dt];
          let hundred = (lower3 % 100 ? JBSystem.TIER4_HUNDREDS.alter : JBSystem.TIER4_HUNDREDS.base)[dh];
          if (hundred && `${hundred}${ten}`.indexOf("tt") > -1) {
            hundred = hundred.slice(0, -1);
          }
          tier3.unshiftWord(unit, du);
          tier3.unshiftWord(ten, dt * 10);
          tier3.unshiftWord(hundred, dh * 100);
        }
      }
      th = th / 1000n;
      thousandthPow++;
    }
  }

}

export class EngNumConv {
  static SYSTEM = {
    DIC: DicSystem,
    JB: JBSystem
  }

  static DEFAULT_OPTIONS: Options = {
    scale: Scale.SHORT,
    longScaleStyle: LongScaleStyle.BRITISH,
    system: "JB",
  };

  static SUFFIX_ILLION = { word: "illion", type: IllionType.SUFFIX };
  static SUFFIX_ILLIARD = { word: "illiard", type: IllionType.SUFFIX };

  options = EngNumConv.DEFAULT_OPTIONS;
  input: Input;

  isInputTier1 = (input: Input): input is InputDetail => 'exp' in input;
  isInputTier3 = (input: Input): input is InputTier3 => 'exp2' in input;
  isInputTier4 = (input: Input): input is InputTier4 => 'exp3' in input;

  constructor(input: Input) {
    this.input = input;
  }

  setOptions(opts: ExOptions) {
    this.options = { ...this.options, ...opts };
    return this;
  }

  validate() {
    if (this.isInputTier1(this.input)) {
      const input = this.input as InputDetail;
      if (!isNumber(input.coef) || !isNumber(input.exp)) {
        throw new Error("error.coef.numberRequired");
      }
      if (input.exp.indexOf(".") > -1) {
        throw new Error("error.exp.integerRequired");
      }
    } else if (this.isInputTier3(this.input)) {
      const input = this.input as InputTier3;
      if (input.exp2.indexOf(".") > -1) {
        throw new Error("error.exp2.integerRequired");
      }
    } else if (this.isInputTier4(this.input)) {
      const input = this.input as InputTier4;
      if (input.exp3.indexOf(".") > -1) {
        throw new Error("error.exp3.integerRequired");
      }
    }
  }

  convert() {
    this.validate();

    if (this.isInputTier1(this.input)) {
      this.input.coef = this.input.coef.replace(/,/g, "");
      this.input.exp = this.input.exp.replace(/,/g, "");
      return this.convertTier1();
    } else if (this.isInputTier3(this.input)) {
      this.input.exp2 = this.input.exp2.replace(/,/g, "");
      return this.convertTier2();
    } else if (this.isInputTier4(this.input)) {
      this.input.exp3 = this.input.exp3.replace(/,/g, "");
      return this.convertTier3();
    }
    throw new Error("Invalid Input mode");
  }

  convertTier1(): Result {
    const input = this.input as InputDetail;
    const result = new ResultBuilder(this.options);

    let strCoef = input.coef;
    let [, sign, coefInt, coefFrag] = /^([+-]?)0*([0-9]*)(?:.([0-9]*?)0*)?$/.exec(strCoef) ?? [];
    coefInt ??= "0";
    coefFrag ??= "";
    let exp = BigInt(input.exp);

    // Normalize
    strCoef = coefInt + coefFrag;
    exp = exp + BigInt(coefInt.length - 1);

    // Sign
    if (sign === "-") {
      result.negative = true;
    }

    const scale = SCALES[this.options.scale];
    const system = new EngNumConv.SYSTEM[this.options.system]();
    let illion: IllionBuilder;
    let suffix: IllionSuffix;
    let isNextComing;

    do {
      const illionth = scale.toIllionth(exp);
      let numLen = exp - scale.toExp(illionth) + 1n;
      const coefLen = BigInt(strCoef.length);
      let num
      if (coefLen > numLen) {
        num = BigInt(strCoef.slice(0, Number(numLen)));
      } else {
        num = BigInt(strCoef.padEnd(Number(numLen), "0"));
      }

      if (num > 0) {
        if (this.options.longScaleStyle === LongScaleStyle.EUROPEAN
            && illionth > 0n && num >= 1000n) {
          suffix = EngNumConv.SUFFIX_ILLIARD;
          num /= 1000n;
          numLen -= 3n;
        } else {
          suffix = EngNumConv.SUFFIX_ILLION;
        }

        illion = system.calcIllion(illionth, suffix);

        result.build(num, illion);
      }
      
      if (coefLen > numLen) {
        strCoef = strCoef.slice(Number(numLen));
      } else {
        strCoef = "";
      }
      exp -= numLen;

      isNextComing = strCoef && exp > 0n;
      if (num > 0 && isNextComing) {
        result.pushComma();
      }
    } while (isNextComing)

    return result.get();
  }

  convertTier2() {
    const input = this.input as InputTier3;

    const exp2 = BigInt(input.exp2);
    const result = new ResultBuilder(this.options);
    const system = new EngNumConv.SYSTEM[this.options.system]();
    if (exp2 === 0n) {
      const illion = system.calcIllion(1n, EngNumConv.SUFFIX_ILLION);
      result.build(1n, illion);
    } else {
      const illion = system.calcIllionTier2(exp2, EngNumConv.SUFFIX_ILLION);
      result.build(1n, illion);
    }
    return result.get();
  }

  convertTier3() {
    const input = this.input as InputTier4;

    const exp3 = BigInt(input.exp3);
    const result = new ResultBuilder(this.options);
    const system = new EngNumConv.SYSTEM[this.options.system]();
    if (exp3 === 0n) {
      const illion = system.calcIllionTier2(3n, EngNumConv.SUFFIX_ILLION);
      result.build(1n, illion);
    } else {
      const illion = system.calcIllionTier3(exp3, EngNumConv.SUFFIX_ILLION);
      result.build(1n, illion);
    }
    return result.get();
  }

}

class SmallNumberConv {
  static ZERO = { n: "0", name: "zero" };

  static WORD_UNITS = [
    null,
    { n: 1, name: "one" },
    { n: 2, name: "two" },
    { n: 3, name: "three" },
    { n: 4, name: "four" },
    { n: 5, name: "five" },
    { n: 6, name: "six" },
    { n: 7, name: "seven" },
    { n: 8, name: "eight" },
    { n: 9, name: "nine" },
    { n: 10, name: "ten" },
    { n: 11, name: "eleven" },
    { n: 12, name: "twelve" },
    { n: 13, name: "thirteen" },
    { n: 14, name: "fourteen" },
    { n: 15, name: "fifteen" },
    { n: 16, name: "sixteen" },
    { n: 17, name: "seventeen" },
    { n: 18, name: "eighteen" },
    { n: 19, name: "nineteen" },
  ];

  static WORD_TENS = [
    null,
    null,
    { n: 2, name: "twenty" },
    { n: 3, name: "thirty" },
    { n: 4, name: "forty" },
    { n: 5, name: "fifty" },
    { n: 6, name: "sixty" },
    { n: 7, name: "seventy" },
    { n: 8, name: "eighty" },
    { n: 9, name: "ninety" },
  ];

  convert(num: bigint) {
    const digits = num.toString()
      .padStart(6, "0")
      .split("")
      .map(d => parseInt(d));

    const upper3 = this.convert3(digits.slice(0, 3));
    const lower3 = this.convert3(digits.slice(3));

    const result = [];
    if (upper3.number) {
      result.push(`${upper3.words} thousand${lower3.number ? "," : ""}`);
    }
    if (lower3.number) {
      result.push(lower3.words);
    }
    return {
      words: result.join(" "),
      num: parseInt(digits.join(""))
    };
  }

  convert3(digits: number[]) {
    const hundreds = SmallNumberConv.WORD_UNITS[digits[0]];
    const tens = SmallNumberConv.WORD_TENS[digits[1]];
    const teens = SmallNumberConv.WORD_UNITS[digits[1] * 10 + digits[2]];
    const units = SmallNumberConv.WORD_UNITS[digits[2]];

    const result = [];
    if (hundreds) {
      result.push(`${hundreds.name} hundred`);
    }
    if (tens && units) {
      result.push(tens.name + "-" + units.name);
    } else if (digits[1] === 1 && teens) {
      result.push(teens.name);
    } else if (tens) {
      result.push(tens.name);
    } else if (units) {
      if (hundreds && !tens) {
        result.push("and");
      }
      result.push(units.name);
    }

    return {
      words: result.join(" "),
      number: parseInt(digits.join(""))
    };
  }
}

class ResultBuilder {
  static COMMA: Comma = {
    words: ",",
    type: "c"
  }

  data: ResultData = [];
  options: Options;
  negative: Boolean = false;

  constructor(options: Options) {
    this.options = options;
  }

  build(num: bigint, illion: IllionRootBuilder) {
    const snum = new SmallNumberConv();
    const snumResult = snum.convert(num);
    let numWords = snumResult.words.toString();
    const numPart = {
      digits: snumResult.num.toString(),
      words: numWords,
      type: IllionType.NUMBER
    };

    this.data.push(numPart, ...illion.nodes);
  }

  pushComma() {
    this.data.push(ResultBuilder.COMMA);
  }

  get() {
    if (!this.data.length) {
      this.data.push({
        digits: "0",
        words: "zero",
        type: IllionType.NUMBER
      });
    } else if (this.negative) {
      this.data.unshift({
        digits: "-",
        words: "minus",
        type: IllionType.NUMBER
      });
    }
    return new Result(this.data);
  }
}

class Result {
  data: ResultData;

  constructor(data: ResultData) {
    this.data = data;
  }

  toText(format: ResultFormat = ResultFormat.SOFT_HYPHENS) {
    let separator;
    switch(format) {
      case ResultFormat.PLAIN:
        separator = "";
        break;
      case ResultFormat.SOFT_HYPHENS:
        separator = "\u00ad";
        break;
      case ResultFormat.HYPHENS:
        separator = "-";
        break;
    }

    let text = "";
    for (const word of this.data) {
      switch(word.type) {
        case IllionType.NUMBER:
          text += word.words + " ";
          break;
        case IllionType.PART:
          const parts = this.joinWords(word.parts)
          if (parts.length) {
            text += parts.join(separator) + separator;
          };
          break;
        case IllionType.COMMA:
          text += ", ";
          break;
        case IllionType.SUFFIX:
          text += word.word;
      }
    }
    text = text.slice(0, 1).toLocaleUpperCase("en-US") + text.slice(1);
    return text;
  }

  joinWords(parts: IllionNode[]) {
    const words: string[] = [];
    for (const word of parts) {
      switch(word.type) {
        case IllionType.PART:
          words.push(...this.joinWords(word.parts));
          break;
        case IllionType.WORD:
          words.push(word.word);
          break;
      }
    }
    return words;
  }

  toSpeechText() {
    let text = "";
    for (const word of this.data) {
      switch(word.type) {
        case IllionType.NUMBER:
          text += word.words + " ";
          break;
        case IllionType.PART:
          text += this.joinSpeechText(word.parts).join("-");
          break;
        case IllionType.COMMA:
          // Ignored
          break;
        case IllionType.SUFFIX:
          text += word.word;
      }
    }
    return text;
  }

  joinSpeechText(nodes: IllionNode[]) {
    const words: string[] = [];
    let parts = "";
    for (const node of nodes) {
      if (node.type === IllionType.PART) {
        if (node.tier < 4) {
          parts && words.push(parts);
          parts = "";
          words.push(...this.joinSpeechText(node.parts));
        } else {
          parts += this.joinSpeechText(node.parts).join("");
        }
      }
      if (node.type === IllionType.WORD) {
        parts += node.word;
      }
    }
    parts && words.push(parts);
    return words;
  }
}

export function isNumber(val: string) {
  return val.match(/^[-+]?([0-9,]+\.?|\.[0-9]+|[0-9,]+\.[0-9]+)$/)
}

const BigMath = {
  abs(x: bigint) {
    return x < 0n || x === -0n ? -x : x
  },
  sign(x: bigint) {
    if (x === 0n) return 0n
    return x < 0n ? -1n : 1n
  },
  min(value: bigint, ...values: bigint[]) {
    for (const v of values)
      if (v < value) value = v
    return value
  },
  max(value: bigint, ...values: bigint[]) {
    for (const v of values)
      if (v > value) value = v
    return value
  }
}