# spider
根据本地HTML文件爬取网上的html内容到本地



必要的参数：
	netposition 	
		//string 
		//e.g 'https://www.multcloud.com/support-clouds/'
		//路径可以是具体的一个以'.html'结束的绝对路径，也可以是文件夹路径，当为文件夹时，将修改文件夹内的HTML文件

	localposition
		//string 
		//e.g 'C:\\Users\\yanyi\\Desktop\\support-clouds'
		//路径可以是具体的一个以'.html'结束的绝对路径，也可以是文件夹路径，当为文件夹时，将修改文件夹内的HTML文件

	netselectors
	localselectors
		//array
		//e.g [
					'.function-drop h2:first-child',
					'.function-drop span:nth-child(2)'
				] 跟jQuery选择器用法一致
		//注意：两者之间的选择器应该是相互对应的，即netselectors中的第一个选择器的内容应该放在localselectors中第一个选择器所选中的标签中

