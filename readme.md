# 日志
- 1.2.1 crypto增加unicode

# 功能列表
> text 文本处理            
> crypto 文本加密解密        
> date 日期扩展       
> file 文件操作扩展      
> ip ip地址工具          

## text

- trim(str) 删除字符串前后空字符，并把文中的连续多个空字符替换成一个
- stripBOM(str) 删除文本文件的BOM标记

## crypto

- md5(str) 对字符串做MD5加密
- unicode(key) 产生一个标识码

## date

- timestamp 时间戳
- Format 类似于'YYYY/MM/DD hh:mm:ss S'的形式返回时间 

## file

- makePath(prePath, appid, userid) 根据用户信息拼接用户目录
- mkDirs(dirpath) 递归方式创建目录
- getAllFiles(dirpath) 指定目录下的所有文件，包括子目录

## ip

- remote(req) 根据http请求获得客户端ip地址
