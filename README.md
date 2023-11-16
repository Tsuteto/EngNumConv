# 英語数詞変換
数字を英語の読み方に変換します。<br>
Vue.jsで実装してみました。JS標準のBigIntも面倒ながら使っています。<br>（BigIntは以前「仏典数詞変換」で使用したライブラリのように実数の計算に対応してもらわないと指数表記との相性が悪い。。）

こちらで使えます。<br/>
https://tsuteto.github.io/EngNumConv/

## 機能
- ショートスケール、ロングスケール両対応
- ロングスケールについては英国表記と欧州表記に対応<br>
  （欧州各国は非英語圏ですが英語の語彙と共通しています）
- 辞書の語彙を使った標準的な命数法（Dictionary system）とJonathan Bowsers氏による拡張定義（[Googology Wiki](https://googology.fandom.com/wiki/Googology_Wiki), [-Illion Numbers](https://www.polytope.net/hedrondude/illion.htm)）の命数法に対応
- 変換結果の出力形式
  - Plain: 通常のテキスト（単語中の行折返しができるようソフトハイフン入り）
  - Hyphenated: 単語(-illion)を構成要素ごと細かくハイフネーションした形式
  - Described: 単語(-illion)の成り立ちが分かるよう要素ごとにTierの色付けと序数を加えた形式

特に拡張定義により次のような大きな数に対応します。

ショートスケール：
$$10^{\~[\~3\~×\~10^{\~\\{\~3\~×\~10^{\~(\~3\~×\~10^{45}\~-\~1\~)}\~\\}}\~+\~3\~]}$$

ロングスケール：
$$10^{\~[\~6\~×\~10^{\~\\{\~6\~×\~10^{\~(\~6\~×\~10^{45}\~-\~1\~)}\~\\}}\~]}$$

簡潔に表すとおおよそ $10^{10^{10^{10^{45}}}}$ に相当します。

一方、辞書による命数法はショートスケールで 10<sup> ( 3 × 10<sup>100000</sup> + 3 )</sup> までとなります。（millinillion = 10<sup>3003</sup> より先は-illi-を連結していく単純なものとなり非常に長くなります）

## Tierについて（Described表示での色分け）
拡張定義においてはTierという概念が出てきます。Described表示での色分けの意味になりますので簡単に説明します（ショートスケール基準）。

millionを1番目、billionを2番目、trillionを3番目…というふうに、なんとかillion（以下"-illion"と呼びます）を数えるとmillillionが1000番目にあたり、この一つ下999番目のnovenonagentanongentillionまでで一つの体系を成しています。これをTier 1としてグループ化しています。millillion以降は少し形は違いますがmillillionのmillillion倍（2乗）をdu-millillion、3乗をtri-millillion、4乗をquadri-millillionとTier 1を反復しまたmillillionの1000乗に到達するとmicrillion（2番目）、2000乗はnanillion（3番目）と新たな体系が始まり、1000番目のkillillionの一つ下enne­enneaconte­enneahec­tillionまでを異なるグループとしTier 2と呼ぶといった具合です。

つまり1000個ごとに異なる命名規則になっているためグループ化しているということです。

次にそれぞれのTierの範囲とDescribed表示での色を示します。

### Tier 0
0 ～ 1,000,000未満

Described表示では無色

### Tier 1
1,000,000 (million) ～ $10^{3003}$ (millillion) 未満

Described表示では<span style="border: 1px solid #a8a200; background-color: #ffff0030">黄色</span>

### Tier 2
$10^{3003}$ (millillion) ～ $10^{\~(\~3\~×\~10^{3000}\~+\~3\~)}$ (killillion) 未満

Described表示では<span style="border: 1px solid #436be3; background-color: #0040ff30">青</span>

### Tier 3
$10^{\~(\~3\~×\~10^{3000}\~+\~3\~)}$ (killillion) ～ $10^{\~\\{\~3\~×\~10^{\~(\~3\~×\~10^{3000}\~)}\~+\~3\~\\}}$ (kalillion) 未満

Described表示では<span style="border: 1px solid #4fbe31; background-color: #35f60030">緑</span>

### Tier 4
$10^{\~\\{\~3\~×\~10^{\~(\~3\~×\~10^{3000}\~)}\~+\~3\~\\}}$ (kallillion) ～ $10^{\~[\~3\~×\~10^{\~\\{\~3\~×\~10^{\~(\~3\~×\~10^{3000}\~)}\~\\}}\~+\~3\~]}$ 未満

Described表示では<span style="border: 1px solid #cd5a20; background-color: #ff550030">赤</span>

multillionまでの一部対応です

## Dependecies
See package.json

## License
MIT License

## Acknowledgements
- [Googology Wiki](https://googology.fandom.com/wiki/Googology_Wiki) - I learned names of big numbers a lot there.
- [Pointless large Number Stuff](https://sites.google.com/site/pointlesslargenumberstuff/home/1/bowersillions) by cookiefonster - Detailed explanation of the Bowsers' number system. This helped me a lot to implement.
- [Extended Standard](https://docs.google.com/document/d/1K8Oj1As5p8S4hq_9zY_ZD29jdkLw7ZRV7Ka-5J8toE4/edit#heading=h.ghx2w5sladbm) in [Aarex Googology](https://aarextiaokhiao.github.io/googology.html) by Aarex Tiaokhiao - Another explanation of the number system. This also helped me.
