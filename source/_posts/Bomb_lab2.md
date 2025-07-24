---
title: Bomb_lab2
date: 2018-12-01 17:20:21
categories:
 - CS:APP
tags:
 - CS:APP
 - 汇编
 - 二进制炸弹
---
## 实验步骤
<!--more-->
### 准备工作
使用tar -vxf将炸弹压缩包解压,cd进入,可以从bomb.c中看出实验的用意以及程序的大致
逻辑,bomb为可执行程序,使用gdb调试该程序.
```bash
(gdb) b read_line 
Breakpoint 1 at 0x40155c
(gdb) b explode_bomb 
Breakpoint 2 at 0x4014e4
```
给read_line函数打上断点,以便每次输入运行一关.给explode_bomb打上断点,以便在炸弹爆炸
前可以处理.
### phase_1
获得phase_1汇编代码
```bash
(gdb) disas phase_1
Dump of assembler code for function phase_1:
   0x0000000000400e80 <+0>:	sub    $0x8,%rsp
   0x0000000000400e84 <+4>:	mov    $0x4024a0,%esi
   0x0000000000400e89 <+9>:	callq  0x40127e <strings_not_equal>
   0x0000000000400e8e <+14>:	test   %eax,%eax
   0x0000000000400e90 <+16>:	je     0x400e97 <phase_1+23>
   0x0000000000400e92 <+18>:	callq  0x4014e4 <explode_bomb>
   0x0000000000400e97 <+23>:	add    $0x8,%rsp
   0x0000000000400e9b <+27>:	retq   
End of assembler dump.
```
可见,此题是将我们输入的字符串与地址0x4024a0处字符串比较,不等则爆炸.查看该字符串.
```bash
(gdb) x/s 0x4024a0
0x4024a0 <__dso_handle+344>:	 "We have to stand with our North Korean allies."
```
那么答案是We have to stand with our North Korean allies.
### phase_2
```bash
(gdb) disas phase_2
Dump of assembler code for function phase_2:
   0x0000000000400e9c <+0>:	push   %rbp
   0x0000000000400e9d <+1>:	push   %rbx
   0x0000000000400e9e <+2>:	sub    $0x28,%rsp
   0x0000000000400ea2 <+6>:	mov    %rsp,%rsi
   0x0000000000400ea5 <+9>:	callq  0x40151a <read_six_numbers>
   0x0000000000400eaa <+14>:	cmpl   $0x1,(%rsp)
   0x0000000000400eae <+18>:	je     0x400ed0 <phase_2+52>
   0x0000000000400eb0 <+20>:	callq  0x4014e4 <explode_bomb>
   0x0000000000400eb5 <+25>:	jmp    0x400ed0 <phase_2+52>
   0x0000000000400eb7 <+27>:	mov    -0x4(%rbx),%eax
   0x0000000000400eba <+30>:	add    %eax,%eax
   0x0000000000400ebc <+32>:	cmp    %eax,(%rbx)
   0x0000000000400ebe <+34>:	je     0x400ec5 <phase_2+41>
   0x0000000000400ec0 <+36>:	callq  0x4014e4 <explode_bomb>
   0x0000000000400ec5 <+41>:	add    $0x4,%rbx
   0x0000000000400ec9 <+45>:	cmp    %rbp,%rbx
   0x0000000000400ecc <+48>:	jne    0x400eb7 <phase_2+27>
   0x0000000000400ece <+50>:	jmp    0x400edc <phase_2+64>
   0x0000000000400ed0 <+52>:	lea    0x4(%rsp),%rbx
   0x0000000000400ed5 <+57>:	lea    0x18(%rsp),%rbp
   0x0000000000400eda <+62>:	jmp    0x400eb7 <phase_2+27>
   0x0000000000400edc <+64>:	add    $0x28,%rsp
---Type <return> to continue, or q <return> to quit---
   0x0000000000400ee0 <+68>:	pop    %rbx
   0x0000000000400ee1 <+69>:	pop    %rbp
   0x0000000000400ee2 <+70>:	retq   
End of assembler dump.
```
+3处发现在栈中开辟了0x28的内存区域.然后将%rsp的值传给%rsi作为
参数传给函数read_six_numbers,可以看出应该使用开辟的空闲内存做
数组,记数组为r,读取六个数字.将(%rsp)和0x1比较,如果不等,就会爆
炸,(％rsp)为数组首元,故r[0]＝１;跳转到+52,将r[1]地址赋给%rbx,
将r[6](实际不存在)地址赋给%rbp,跳到+27,将%eax设为%rbx指向的前一个
数,此时为r[0],比较r[1]和2*r[0]是否相等,不等则爆炸.跳转到+41,％
rbx+4,比较%rbx和%rbp,不等跳转到+27,重复,等则跳转到+64结束,成功
.可以看出，这是一个循环比较.等价于下面的c语a言

```cpp
for(int *b = &r[1]; b != &r[6]; b++)
{
    if(*b != 2 * (*(b - 1)))
        call explode_bomb;
```
故答案应该为1 2 4 8 16 32.

### phase_3
```bash
   0x0000000000400ef1 <+14>:	mov    $0x4027cd,%esi
   0x0000000000400ef6 <+19>:	mov    $0x0,%eax
   0x0000000000400efb <+24>:	callq  0x400ba0 <__isoc99_sscanf@plt>
   0x0000000000400f00 <+29>:	cmp    $0x1,%eax
```
查看0x4027cd,
```bash
(gdb) x/s 0x4027cd
0x4027cd:	 "%d %d"
```
可知,应该是读入了两个整数.
```bash
   0x0000000000400f15 <+50>:	jmpq   *0x402500(,%rax,8)
   0x0000000000400f1c <+57>:	mov    $0x0,%eax
   0x0000000000400f21 <+62>:	jmp    0x400f28 <phase_3+69>
   0x0000000000400f23 <+64>:	mov    $0x19c,%eax
   0x0000000000400f28 <+69>:	sub    $0xcd,%eax
   0x0000000000400f2d <+74>:	jmp    0x400f34 <phase_3+81>
   0x0000000000400f2f <+76>:	mov    $0x0,%eax
   0x0000000000400f34 <+81>:	add    $0x29b,%eax
   0x0000000000400f39 <+86>:	jmp    0x400f40 <phase_3+93>
   0x0000000000400f3b <+88>:	mov    $0x0,%eax
---Type <return> to continue, or q <return> to quit---
   0x0000000000400f40 <+93>:	sub    $0x36f,%eax
   0x0000000000400f45 <+98>:	jmp    0x400f4c <phase_3+105>
   0x0000000000400f47 <+100>:	mov    $0x0,%eax
   0x0000000000400f4c <+105>:	add    $0x36f,%eax
   0x0000000000400f51 <+110>:	jmp    0x400f58 <phase_3+117>
   0x0000000000400f53 <+112>:	mov    $0x0,%eax
   0x0000000000400f58 <+117>:	sub    $0x36f,%eax
   0x0000000000400f5d <+122>:	jmp    0x400f64 <phase_3+129>
   0x0000000000400f5f <+124>:	mov    $0x0,%eax
   0x0000000000400f64 <+129>:	add    $0x36f,%eax
   0x0000000000400f69 <+134>:	jmp    0x400f70 <phase_3+141>
   0x0000000000400f6b <+136>:	mov    $0x0,%eax
   0x0000000000400f70 <+141>:	sub    $0x36f,%eax
   0x0000000000400f75 <+146>:	jmp    0x400f81 <phase_3+158>
   0x0000000000400f77 <+148>:	callq  0x4014e4 <explode_bomb>
   0x0000000000400f7c <+153>:	mov    $0x0,%eax
   0x0000000000400f81 <+158>:	cmpl   $0x5,0xc(%rsp)
   0x0000000000400f86 <+163>:	jg     0x400f8e <phase_3+171>
   0x0000000000400f88 <+165>:	cmp    0x8(%rsp),%eax
   0x0000000000400f8c <+169>:	je     0x400f93 <phase_3+176>
   0x0000000000400f8e <+171>:	callq  0x4014e4 <explode_bomb>
```
由这段汇编代码可知,这是一段switch语句,使用输入的第一个值作为key,
经过对应跳转位置的操作后应与第二个数相等.
```bash
(gdb) p/x *（0x402500 + 32）
$1 = 0x400f47
```
那么第一个数为0时,跳转到0x400f23处,那么第二个数应该为此处的0x0,
故一组答案为4 0;
### phase_4

```bash
(gdb) disas phase_4
Dump of assembler code for function phase_4:
   0x0000000000400fd0 <+0>:	sub    $0x18,%rsp
   0x0000000000400fd4 <+4>:	lea    0xc(%rsp),%rcx
   0x0000000000400fd9 <+9>:	lea    0x8(%rsp),%rdx
   0x0000000000400fde <+14>:	mov    $0x4027cd,%esi
   0x0000000000400fe3 <+19>:	mov    $0x0,%eax
   0x0000000000400fe8 <+24>:	callq  0x400ba0 <__isoc99_sscanf@plt>
   0x0000000000400fed <+29>:	cmp    $0x2,%eax
   0x0000000000400ff0 <+32>:	jne    0x400ffe <phase_4+46>
   0x0000000000400ff2 <+34>:	mov    0xc(%rsp),%eax
   0x0000000000400ff6 <+38>:	sub    $0x2,%eax
   0x0000000000400ff9 <+41>:	cmp    $0x2,%eax
   0x0000000000400ffc <+44>:	jbe    0x401003 <phase_4+51>
   0x0000000000400ffe <+46>:	callq  0x4014e4 <explode_bomb>
   0x0000000000401003 <+51>:	mov    0xc(%rsp),%esi
   0x0000000000401007 <+55>:	mov    $0x9,%edi
   0x000000000040100c <+60>:	callq  0x400f98 <func4>
   0x0000000000401011 <+65>:	cmp    0x8(%rsp),%eax
   0x0000000000401015 <+69>:	je     0x40101c <phase_4+76>
   0x0000000000401017 <+71>:	callq  0x4014e4 <explode_bomb>
   0x000000000040101c <+76>:	add    $0x18,%rsp
   0x0000000000401020 <+80>:	retq   
End of assembler dump.
```
由代码易知,phase_4读入了两个数,第二个数在2-4之间,然后将第二个数作为
func4的第二个参数,func4第一个参数为9,输入的第一个数必须和func4返回值相等.
```bash
(gdb) disas func4 
Dump of assembler code for function func4:
   0x0000000000400f98 <+0>:	push   %r12
   0x0000000000400f9a <+2>:	push   %rbp
   0x0000000000400f9b <+3>:	push   %rbx
   0x0000000000400f9c <+4>:	mov    %edi,%ebx
   0x0000000000400f9e <+6>:	test   %edi,%edi
   0x0000000000400fa0 <+8>:	jle    0x400fc6 <func4+46>
   0x0000000000400fa2 <+10>:	mov    %esi,%ebp
   0x0000000000400fa4 <+12>:	mov    %esi,%eax
   0x0000000000400fa6 <+14>:	cmp    $0x1,%edi
   0x0000000000400fa9 <+17>:	je     0x400fcb <func4+51>
   0x0000000000400fab <+19>:	lea    -0x1(%rdi),%edi
   0x0000000000400fae <+22>:	callq  0x400f98 <func4>
   0x0000000000400fb3 <+27>:	lea    (%rax,%rbp,1),%r12d
   0x0000000000400fb7 <+31>:	lea    -0x2(%rbx),%edi
   0x0000000000400fba <+34>:	mov    %ebp,%esi
   0x0000000000400fbc <+36>:	callq  0x400f98 <func4>
   0x0000000000400fc1 <+41>:	add    %r12d,%eax
   0x0000000000400fc4 <+44>:	jmp    0x400fcb <func4+51>
   0x0000000000400fc6 <+46>:	mov    $0x0,%eax
   0x0000000000400fcb <+51>:	pop    %rbx
   0x0000000000400fcc <+52>:	pop    %rbp
   0x0000000000400fcd <+53>:	pop    %r12
   0x0000000000400fcf <+55>:	retq   
End of assembler dump.
```
此函数等价于下面的c代码
```cpp
int func4(int a, int b)
{
    if(a <= 0)
        return 0;
    if(a == 1)
        return b;
    return b + func4(a - 1, b) + func4(n - 2, b);
}
```
穷举2-4的值即可得到答案,取答案为176 2

### phase_5
```bash
(gdb) disas phase_5
Dump of assembler code for function phase_5:
   0x0000000000401021 <+0>:	push   %rbx
   0x0000000000401022 <+1>:	mov    %rdi,%rbx
   0x0000000000401025 <+4>:	callq  0x401261 <string_length>
   0x000000000040102a <+9>:	cmp    $0x6,%eax
   0x000000000040102d <+12>:	je     0x401034 <phase_5+19>
   0x000000000040102f <+14>:	callq  0x4014e4 <explode_bomb>
   0x0000000000401034 <+19>:	mov    $0x0,%eax
   0x0000000000401039 <+24>:	mov    $0x0,%edx
   0x000000000040103e <+29>:	movzbl (%rbx,%rax,1),%ecx
   0x0000000000401042 <+33>:	and    $0xf,%ecx
   0x0000000000401045 <+36>:	add    0x402540(,%rcx,4),%edx
   0x000000000040104c <+43>:	add    $0x1,%rax
   0x0000000000401050 <+47>:	cmp    $0x6,%rax
   0x0000000000401054 <+51>:	jne    0x40103e <phase_5+29>
   0x0000000000401056 <+53>:	cmp    $0x27,%edx
   0x0000000000401059 <+56>:	je     0x401060 <phase_5+63>
   0x000000000040105b <+58>:	callq  0x4014e4 <explode_bomb>
   0x0000000000401060 <+63>:	pop    %rbx
   0x0000000000401061 <+64>:	retq   
End of assembler dump.
```
由汇编代码可知,需要输入一个长度为6的字符串.令该字符串为input,+36处出现的
数组为array,则该汇编等价于下面代码.
```cpp
for(int i = 0; i < 6; i++)
    sum += array[ input[i] & 0xf ];
```
意为遍历输入字符串,取该字符串低4位作为array下标,取出array值相加.
查看array的值  
```bash
(gdb) p/x *0x402540@16
$2 = {0x2, 0xa, 0x6, 0x1, 0xc, 0x10, 0x9, 0x3, 0x4, 0x7, 0xe, 0x5, 0xb, 0x8, 
  0xf, 0xd}
```
题目要求sum = 0x27,故从array中选出6个和为0x27的数,通过这6个数的下标找出对应字符.
答案应为01347L;

### phase_6
因为课程未对后续两关作要求,故不做特别详细的解答.
```bash
(gdb) disas phase_6
Dump of assembler code for function phase_6:
   0x0000000000401062 <+0>:	push   %r13
   0x0000000000401064 <+2>:	push   %r12
   0x0000000000401066 <+4>:	push   %rbp
   0x0000000000401067 <+5>:	push   %rbx
   0x0000000000401068 <+6>:	sub    $0x58,%rsp
   0x000000000040106c <+10>:	lea    0x30(%rsp),%rsi
   0x0000000000401071 <+15>:	callq  0x40151a <read_six_numbers>
   0x0000000000401076 <+20>:	lea    0x30(%rsp),%r13
   0x000000000040107b <+25>:	mov    $0x0,%r12d
   0x0000000000401081 <+31>:	mov    %r13,%rbp
   0x0000000000401084 <+34>:	mov    0x0(%r13),%eax
   0x0000000000401088 <+38>:	sub    $0x1,%eax
   0x000000000040108b <+41>:	cmp    $0x5,%eax
   0x000000000040108e <+44>:	jbe    0x401095 <phase_6+51>
   0x0000000000401090 <+46>:	callq  0x4014e4 <explode_bomb>
   0x0000000000401095 <+51>:	add    $0x1,%r12d
   0x0000000000401099 <+55>:	cmp    $0x6,%r12d
   0x000000000040109d <+59>:	jne    0x4010a6 <phase_6+68>
   0x000000000040109f <+61>:	mov    $0x0,%esi
   0x00000000004010a4 <+66>:	jmp    0x4010e8 <phase_6+134>
   0x00000000004010a6 <+68>:	mov    %r12d,%ebx
   0x00000000004010a9 <+71>:	movslq %ebx,%rax
---Type <return> to continue, or q <return> to quit---
   0x00000000004010ac <+74>:	mov    0x30(%rsp,%rax,4),%eax
   0x00000000004010b0 <+78>:	cmp    %eax,0x0(%rbp)
   0x00000000004010b3 <+81>:	jne    0x4010ba <phase_6+88>
   0x00000000004010b5 <+83>:	callq  0x4014e4 <explode_bomb>
   0x00000000004010ba <+88>:	add    $0x1,%ebx
   0x00000000004010bd <+91>:	cmp    $0x5,%ebx
   0x00000000004010c0 <+94>:	jle    0x4010a9 <phase_6+71>
   0x00000000004010c2 <+96>:	add    $0x4,%r13
   0x00000000004010c6 <+100>:	jmp    0x401081 <phase_6+31>
   0x00000000004010c8 <+102>:	mov    0x8(%rdx),%rdx
   0x00000000004010cc <+106>:	add    $0x1,%eax
   0x00000000004010cf <+109>:	cmp    %ecx,%eax
   0x00000000004010d1 <+111>:	jne    0x4010c8 <phase_6+102>
   0x00000000004010d3 <+113>:	jmp    0x4010da <phase_6+120>
   0x00000000004010d5 <+115>:	mov    $0x603410,%edx
   0x00000000004010da <+120>:	mov    %rdx,(%rsp,%rsi,2)
   0x00000000004010de <+124>:	add    $0x4,%rsi
   0x00000000004010e2 <+128>:	cmp    $0x18,%rsi
   0x00000000004010e6 <+132>:	je     0x4010fd <phase_6+155>
   0x00000000004010e8 <+134>:	mov    0x30(%rsp,%rsi,1),%ecx
   0x00000000004010ec <+138>:	cmp    $0x1,%ecx
   0x00000000004010ef <+141>:	jle    0x4010d5 <phase_6+115>
   0x00000000004010f1 <+143>:	mov    $0x1,%eax
---Type <return> to continue, or q <return> to quit---
   0x00000000004010f6 <+148>:	mov    $0x603410,%edx
   0x00000000004010fb <+153>:	jmp    0x4010c8 <phase_6+102>
   0x00000000004010fd <+155>:	mov    (%rsp),%rbx
   0x0000000000401101 <+159>:	lea    0x8(%rsp),%rax
   0x0000000000401106 <+164>:	lea    0x30(%rsp),%rsi
   0x000000000040110b <+169>:	mov    %rbx,%rcx
   0x000000000040110e <+172>:	mov    (%rax),%rdx
   0x0000000000401111 <+175>:	mov    %rdx,0x8(%rcx)
   0x0000000000401115 <+179>:	add    $0x8,%rax
   0x0000000000401119 <+183>:	cmp    %rsi,%rax
   0x000000000040111c <+186>:	je     0x401123 <phase_6+193>
   0x000000000040111e <+188>:	mov    %rdx,%rcx
   0x0000000000401121 <+191>:	jmp    0x40110e <phase_6+172>
   0x0000000000401123 <+193>:	movq   $0x0,0x8(%rdx)
   0x000000000040112b <+201>:	mov    $0x5,%ebp
   0x0000000000401130 <+206>:	mov    0x8(%rbx),%rax
   0x0000000000401134 <+210>:	mov    (%rax),%eax
   0x0000000000401136 <+212>:	cmp    %eax,(%rbx)
   0x0000000000401138 <+214>:	jge    0x40113f <phase_6+221>
   0x000000000040113a <+216>:	callq  0x4014e4 <explode_bomb>
   0x000000000040113f <+221>:	mov    0x8(%rbx),%rbx
   0x0000000000401143 <+225>:	sub    $0x1,%ebp
   0x0000000000401146 <+228>:	jne    0x401130 <phase_6+206>
---Type <return> to continue, or q <return> to quit---
   0x0000000000401148 <+230>:	add    $0x58,%rsp
   0x000000000040114c <+234>:	pop    %rbx
   0x000000000040114d <+235>:	pop    %rbp
   0x000000000040114e <+236>:	pop    %r12
   0x0000000000401150 <+238>:	pop    %r13
   0x0000000000401152 <+240>:	retq   
End of assembler dump.
```
汇编代码很长.其意为输入6个互不相等的数,介于1-6.按这6个数的值从位于地址0x603410的链表中选出对应位置的
节点指针,组成一个数组.按选出的顺序将这六个节点组成新的链表,然后检查这个链表是否为降序.
查看链表的值.
```bash
(gdb) p/x *(0x603410)
$3 = 0x1cf
(gdb) p/x *(0x603410 + 8)
$4 = 0x603420
(gdb) p/x *(0x603420)
$5 = 0x188
(gdb) p/x *(0x603420 + 8)
$6 = 0x603430
(gdb) p/x *(0x603430)
$7 = 0x1d1
(gdb) p/x *(0x603430 + 8)
$8 = 0x603440
(gdb) p/x *(0x603440)
$9 = 0x174
(gdb) p/x *(0x603440 + 8)
$10 = 0x603450
(gdb) p/x *(0x603450)
$11 = 0x220
(gdb) p/x *(0x603450 + 8)
$12 = 0x603460
(gdb) p/x *(0x603460 + 8)
$13 = 0x0
```
故答案应为6 5 3 1 2 4;  

### secret_phase
正常通过前6关是无法触发secret_phase的,查看汇编发现,在phase_4答案之后输入DrEvil即可进入secret_phase.
```bash
(gdb) disas secret_phase 
Dump of assembler code for function secret_phase:
   0x0000000000401191 <+0>:	push   %rbx
   0x0000000000401192 <+1>:	callq  0x40155c <read_line>
   0x0000000000401197 <+6>:	mov    $0xa,%edx
   0x000000000040119c <+11>:	mov    $0x0,%esi
   0x00000000004011a1 <+16>:	mov    %rax,%rdi
   0x00000000004011a4 <+19>:	callq  0x400b80 <strtol@plt>
   0x00000000004011a9 <+24>:	mov    %rax,%rbx
   0x00000000004011ac <+27>:	lea    -0x1(%rax),%eax
   0x00000000004011af <+30>:	cmp    $0x3e8,%eax
   0x00000000004011b4 <+35>:	jbe    0x4011bb <secret_phase+42>
   0x00000000004011b6 <+37>:	callq  0x4014e4 <explode_bomb>
   0x00000000004011bb <+42>:	mov    %ebx,%esi
   0x00000000004011bd <+44>:	mov    $0x603230,%edi
   0x00000000004011c2 <+49>:	callq  0x401153 <fun7>
   0x00000000004011c7 <+54>:	cmp    $0x4,%eax
   0x00000000004011ca <+57>:	je     0x4011d1 <secret_phase+64>
   0x00000000004011cc <+59>:	callq  0x4014e4 <explode_bomb>
   0x00000000004011d1 <+64>:	mov    $0x4024d0,%edi
   0x00000000004011d6 <+69>:	callq  0x400ac0 <puts@plt>
   0x00000000004011db <+74>:	callq  0x401682 <phase_defused>
   0x00000000004011e0 <+79>:	pop    %rbx
   0x00000000004011e1 <+80>:	retq   
---Type <return> to continue, or q <return> to quit---
End of assembler dump.
```
```bash
(gdb) disas fun7
Dump of assembler code for function fun7:
   0x0000000000401153 <+0>:	sub    $0x8,%rsp
   0x0000000000401157 <+4>:	test   %rdi,%rdi
   0x000000000040115a <+7>:	je     0x401187 <fun7+52>
   0x000000000040115c <+9>:	mov    (%rdi),%edx
   0x000000000040115e <+11>:	cmp    %esi,%edx
   0x0000000000401160 <+13>:	jle    0x40116f <fun7+28>
   0x0000000000401162 <+15>:	mov    0x8(%rdi),%rdi
   0x0000000000401166 <+19>:	callq  0x401153 <fun7>
   0x000000000040116b <+24>:	add    %eax,%eax
   0x000000000040116d <+26>:	jmp    0x40118c <fun7+57>
   0x000000000040116f <+28>:	mov    $0x0,%eax
   0x0000000000401174 <+33>:	cmp    %esi,%edx
   0x0000000000401176 <+35>:	je     0x40118c <fun7+57>
   0x0000000000401178 <+37>:	mov    0x10(%rdi),%rdi
   0x000000000040117c <+41>:	callq  0x401153 <fun7>
   0x0000000000401181 <+46>:	lea    0x1(%rax,%rax,1),%eax
   0x0000000000401185 <+50>:	jmp    0x40118c <fun7+57>
   0x0000000000401187 <+52>:	mov    $0xffffffff,%eax
   0x000000000040118c <+57>:	add    $0x8,%rsp
   0x0000000000401190 <+61>:	retq   
End of assembler dump.
```
此题题意为在一个题目中构建好的平衡二叉树中从根节点开始查找一个输入的数.
由节点向左为0,由节点向右为1,查找路径序的0-1列从右向左构成一个二进制数,该
二进制数的十进制值必须等于题目中提供的数,其为4,那么所需查找路径序列为100,
根据二叉树结构,应该查找7,故答案为7.
### 运行截图
![结果](Bomb_lab2/ret1.png)
