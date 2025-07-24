---
title: DS_exp3
date: 2018-12-01 16:00:31
categories:
 - 数据结构
tags:
 - 串匹配
---
### 设计思路
<!--more-->

BM算法是一种后缀匹配算法,其具有比KMP算法更优秀的性能表现.其核心思想有二
,第一是坏字符,坏字符就是pattern与text从右往左第一失配的在text中的字符,
二是好后缀,好后缀就是pattern与text从右往左连续匹配成功的子串.对于坏字符
和好后缀,有各自的模式串移动规则,可以确定各自失配时需要移动的位数,最终选
择二者中移动位数较大者移动.在主函数中,让用户输入文档名与需要查找的单词.
每次从文档中读取一行进行匹配搜索,每次使用BM算法搜索完成后,若搜索到单词,
则将主串中开始匹配的位置定为查找到单词的下一行,使用BM算法进行下一个匹配
搜索,直至搜索完当前行.而后循环直至匹配完整个文档.
### 代码说明
```cpp
int* CreateBC(char* pattern, int len);
```
传入模式串及其长度,返回根据坏字符的跳转数组.
```cpp
int* CreateSuffix(char* pattern, int len);
int* CreateGS(char* pattern, int len);
```
两个函数都需要传入模式串及其长度,第一个函数返回其后缀数组,第二个函数调
用第一个函数返回根据好后缀的跳转数组.
```cpp
int bm_search(char* text, int text_len, char* pattern, int pattern_len, int *bc, int *gs);
```
传入主串及其长度,模式串及其长度,坏字符跳转数组,好后缀跳转数组.返回在主串
中查找到模式串的第一个位置,未查找到,则返回-1.
```cpp
char* get_line(FILE *article, char (&text)[1000]);
```
从给定的article文件中读取最大1000字符的一行,存在text位置,读取到文件末尾
则返回NULL.
### 运行结果
![运行结果](DS_exp3/ret.png)

此为从马丁路德金的I hava a dream演讲稿中查找dream得出的结果.
