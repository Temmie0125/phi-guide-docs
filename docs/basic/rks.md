---
title: Ranking Score（RKS）
---

是可以一定程度上量化玩家水平的数值，以下简称为rks。  
一个玩家的rks为全部常规三难度谱面与AT谱面中最高的27个rks值，与在这些谱面范围内，达成φ评级的谱面中，额外的3个最高rks值，共30个谱面rks值的平均值。（也就是常说的p3+b27或者是b30，说人话就是AP的三首最高定数，加上单曲rks最高的27个取平均）  
在游戏内显示为一个就近取舍后的两位小数。  
  
谱面的单曲rks值计算方法如下：  
当谱面最高准确率未达到70.00%时，该谱面rks为0；  
当谱面最高准确率达到70.00%时，该谱面rks和最高准确率正相关：  
当谱面最高准确率恰好为70.00%时，该谱面rks为谱面定数的九分之一。  
当谱面达成了φ评级时，该谱面rks等于谱面定数。  
也可以使用这个公式计算单曲rks：$rks = \left( \frac{100 \times Acc - 55}{45} \right)^{2} \times level$  
  
截至4.0.1版本，rks的理论最高值为17.32（17.3167），需要以φ评级完成定数最高的27张谱面。  
当前版本定数最高的谱面列表：（如无特殊说明默认为AT难度）  

| 定数（谱面数） | 谱面 |
| --- | --- |
| 18.0（1） | Desultory Signals |
| 17.9（2） | Exoplanetary Mirage、ハテ |
| 17.6（2） | Rrhar'il、Entrance to the Chaos |
| 17.5（2） | Der Schneid、Petrichor |
| 17.4（3） | Distorted Fate、Igallta、QZKago Requiem |
| 17.3（3） | +ERABY+E CONNEC+10N、DESTRUCTION 3,2,1、祈 -我ら神祖と共に歩む者なり- |
| 17.2（2） | AbsoluTe disoRdeR、Stardust:RAY |
| 17.1（2） | Hydra、What do you want more than a Happy ending? |
| 17.0（3） | 幻影鬼魅 (PLEASE)、玩具狂奏曲 -終焉- 、Desultory Signals [IN] |
| 16.9（4） | Re：End of a Dream、Der Richter、Archidoxen、INFiNiTE ENERZY -Overdoze-、 |
| 16.8（4） | sølips、BANGING STRIKE、Entrance to the Chaos [IN]、Exoplanetary Mirage [IN] |
| 16.7（OverFlow） | Diamond Dust、Spasmodic、Stasis、Cuvism³、ハテ[IN]<br>*自4.0.1更新后，理论rks的b27最低位已经提升至16.80，因此不再需要AP16.7定数的歌曲 |

### RKS(b30)查询

查询你的RKS（b30）的详细信息，也就是详细的成绩图。它长这样：  
![image](/images/LLBEBLBCABQEC.jpg)

  
上面显示了你的b30曲目的详细成绩信息，包括分数、评级、准确率。金色的小箭头后面跟着的百分比是推分建议，代表着要让你的rks在游戏显示中+0.01，需要将这首歌的准确率推到多少。曲绘左下角的两个数字分别是本曲定数和你的单曲rks。单曲rks的计算方法在Ranking Score（上面）中提到过，是一个根据准度和歌曲定数计算出来的数值。  
要查询b30也很简单：  
首先在群内找到Bot（Hikari），然后直接在群里输入绑定指令（无需@）。例如：/phi bind qrcode，通过二维码登录。  
然后使用你的TapTap APP扫描Bot发送的二维码，点击确认登录；  
*这一步最方便的是使用两个设备，当然也可以保存二维码至相册，在TapTap扫一扫界面识别相册图片。  
之后你就可以绑定你的账号信息了。每次查分之前，需要先输入/phi update来更新存档，然后再输入/phi pgr生成你的最新成绩图。  
示例：/phi update 更新当前存档  
/phi pgr 生成最新成绩图  
*该Bot由我（Temmie）负责运维，在本群内只开放音游查分功能，如果你想体验更多功能可以加入公告的相关群聊使用。暂不支持加入其他群聊哦~  
*关于Bot还可参见[使用指引](https://www.kdocs.cn/l/cmE8S8PxDCjD)
