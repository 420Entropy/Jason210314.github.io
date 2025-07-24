---
title: DS_work2
date: 2018-11-16 10:04:55
categories:
 - 数据结构
tags:
 - 广义表
---
### 代码
<!--more-->
```cpp
void GList_copy(GList L, GList &N)
{
    //非空表则进入
    if(L)
    {
        N = new GLNode;
        if(!N) //未分配空间
        {
            exit(OVERFLOW);
        }
        N->tag = L->tag; //复制标志位
        if(L->tag==ATOM)    //如果是原子
        {    
            N->atom = L->atom;
        }
        else            //复制表头
        {
            GList_copy(L->hp, N->hp);
        }
        if(!(L->tp))    //表尾为空，则递归完表
        {
            N->tp=NULL;
        }
        else            //复制表尾
        {
            GList_copy(L->tp, N->tp);
        }
    }
}

```
