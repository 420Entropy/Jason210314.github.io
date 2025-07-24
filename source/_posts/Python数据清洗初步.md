---
title: Python数据清洗初步
date: 2018-12-09 17:14:11
categories:
 - Python
tags:
 - 数据清洗
 - ElementTree
 - XML
---

#### 简介

<!--more-->

XML是一种可扩展标记语言，被用来传输和存储数据。它是一种有逻辑的树结构。

#### Python使用xml.ElementTree解析

```python
import xml.etree.ElementTree as ET
import codecs
import json
```

codecs用于打开文件，json用于保存清洗完的数据。

```python
tree = ET.parse()		#获取目录树
root = tree.getroot() 	#得到树根 
root = ET.fromstring()	#从字符串直接解析出树根
```

获取树根，然后进行操作

```python
root.tag		#root元素的标记名
root.attrib		#root元素的属性，为一个dic
for child in root:	#便利子元素
	print(child.tag, child.attrib)
root[0][1].text 	#将元素视为多维数组,用下标访问
root.find("element").text 	#找出root下element下的内容字符串
title = root.get("Title") 	#获取root元素的title属性

for neighbor in root.iter('neighbor'):	#遍历所有特定元素,递归到所有，子、孙...元素
	print(neighbor.attrib)
for country in root.findall('country'):	#找出所有country元素，仅子代
     rank = country.find('rank').text
     name = country.get('name')
     print(name, rank)
for country in root.find('country'):	#仅找出第一个符合的子代
```

### 其他涉及知识

```python
import os

def mkdir(path):	#创建文件夹
    if not os.path.exists(path):
        os.mkdir(path)
        
for son_path in os.listdir(root_path):	#遍历root_path下的文件
    
json.dump(dic, file_obj, ensure_ascii=False, indent=4, separators=(',', ': '))	#将字典dic输出到文件file_obj中,不对ascii进行编码,缩进4,分隔符为','以及': '
```

### 暂时到此