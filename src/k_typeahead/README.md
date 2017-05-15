# k_typeahead

k_typeahead是一个搜索提示插件，效果类似于typeahead，主要改动为移除了对jQuery的依赖。

## 快速开始

```sh
# 引入css文件
<link href="./css/k_typeahead.min.css" rel="stylesheet">

# 创造一个input
<input type="text" id="example" />

# 引入js文件
<script src="./js/k_typeahead.min.js"></script>

# 运行k_typeahead
<script>
	//最基础的运行方式
	new k_typeahead(document.getElementById('example'),{
		//query在用户输入后触发，返回两个参数keyword 和 callback
		query: function(keyword, callback){
			//keyword是用户所输的内容
			console.log(keyword);
			//callback是一个回调，接收一个array参数，值为需要显示的列表
			//正常情况下，您应该使用keyword查询本地数据或发ajax获取相关数据，处理成数组后放入callback中。
			callback([1,2,3,4,5]);
		},
	});
</script>
```

## 运行插件

```sh
# k_typeahead运行至少需要2个参数，一个为绑定的js元素element，另一个为查询方法query。您也可以对插件进行更多设置来个性化插件。
new k_typeahead(element,{query [,otherOps...]});
```

## 自定义设置

k_typeahead提供了一些自定义属性与方法， 您可以根据实际情况进行更改。

### 样例

```sh
new k_typeahead(element,{
	query: function(keyword,callback){},
	width: 200,
	height: 300,
	timer: 600,
	...
});
```

### width

默认值：和绑定的input等宽

类型：number

通过改变width可以自定义搜索提示列表的宽度。

### height

默认值：auto（由内容高度决定）

类型：number

通过改变height可以自定义搜索提示列表的高度。

### timer

默认值：500（单位：毫秒）

类型：number

timer是设置用户输入后停顿多少时间触发query方法。参数的意义在于防止用户在连续输入时频繁触发query方法。

### maxList

默认值：10

类型：number

maxList是设置搜索提示列表显示最多的条数。

### searchEmpty

默认值：false

类型：bool

searchEmpty是设置当输入为空时是否进行搜索查询，默认关闭。

### className

默认值：无

类型：string

className是给k_typeahead搜索提示列表基础结构最外层添加类名。

### query

默认值：function(){}

类型：function

入参：

	keyword （strong）

	callback （function(array){}）

返回：无

query是在用户输入停止后触发的方法，用于对用户的查询进行处理。入参有两个，keyword为用户输入的查询词，callback为处理后的回调，接收处理好的列表数据。callback最少需传入一个数组参数，否则会抛出错误。如果您不打算调用buildList拼接结构，则传入的数组必须为一维数组，否则程序将无法解析。callback可以接收更多的参数，具体作用在下面的buildList进行介绍。

query不需要返回值。

### buildList

默认值：无

类型：function

入参：

	index （number）

	list （array）

	arguments...

返回：txt （str）

buildList允许自定义列表结构。方法的入参index，值为query方法中传入的数组的索引。入参list，值为query方法中传入的数组。如果您在query的callback中传入了更多的参数，他们会在buildList中原封不动的返回出来。您可以利用这些数据去帮助您更好的自定义列表的结构。

在您构建完列表结构后，需要以字符串的形式将结构返回(return)出去。

### buildBase

默认值：function(ul){return ul}

类型：function

入参：

	list （str）

返回：txt （str）

buildBase允许自定义搜索提示列表的基础结构。默认情况下，搜索列表只是一个单纯的list，如果你想要给列表加上一个头部或一个尾部，可以使用此方法。

buildBase只有一个入参list，值为搜索列表结构的字符串。您可以通过字符串拼接的方式加入您自定义的内容。

在您构建完列表的基础结构后，需要以字符串的形式将结构返回(return)出去。

### activeFn

默认值：function(){}

类型：function

入参：

	element （object）

返回：无

activeFn允许增加用户选择某条查询后的交互效果。当用户用鼠标或回车选中某条数据后，k_typeahead会进行一系列的处理，比如关闭搜索提示列表，将用户选中的值放入input。如果您想进行额外的处理，可以使用此方法。activeFn只有一个入参element，值为用户选中数据对应的Li节点。

activeFn不需要返回值。

### inputShowVal

默认值：无

类型：function

入参：

	element （object）

	toTxt （function）

返回：txt （str）

inputShowVal允许自定义当使用键盘上下选择或鼠标确定时input内的显示值。入参element的值为用户当前选择数据对应的Li节点，toTxt是一个简易的将html结构转成txt文本的方法，功能类似jQuery的text()，您可以使用它把处理好的对象return出去。如果您有更好的实现方法或调用了其他插件实现该功能，您可以忽略该参数。

在您处理完成后，需要以字符串的形式将结果返回(return)出去。

### heightLight

默认值：function(){}

类型：function

入参：

	keyword （str）

返回：txt （str）

heightLight允许自定义用户选中后的高亮效果。k_typeahead默认会给匹配的单词加上strong标签进行加粗展示，但如果您想要别的提示效果，可以使用此方法。

heightLight只有一个入参keyword，值为匹配到的需要重点显示的字符串。如果您想要换个颜色进行提示，可以通过字符串拼接的方式给它加上span标签并给上对应的样式。如果你不想要提示效果，将keyword直接返回出去就好。

在您选择好提示效果后，需要以字符串的形式将结构返回(return)出去。

### customHeightLight

默认值：''

类型：function

入参：

	keyword （str）

	txt （str）

	data （object）

返回：txt （str）

customHeightLight是heightLight的高阶方法。比起heightLight，它会多两个入参，txt的值为整个需要匹配的内容的html结构。data为拼接结构时的对象。调用此方法后，k_typeahead不会再进行匹配高亮处理，所有高亮效果都交由您自己定义。

在您处理完成后，需要以字符串的形式将结构返回(return)出去。

## 方法

k_typeahead暴露了一些方法，在某些特殊场合，您可能希望运行这些方法来处理某些问题。

### 样例

```sh
//初始化k_typeahead，并寄存在变量中。
var example = new k_typeahead(element,{
	query: function(keyword,callback){},
	width: 200,
	height: 300,
	timer: 600,
	...
});
//运行k_typeahead暴露的初始化方法
example.init();
```

### init

init可以重新初始化k_typeahead。在某些场合，比如弹窗中，可能需要重新对k_typeahead进行初始化。

### position

position可以对搜索提示列表进行定位。当您对结构进行了修改使input位置变化导致搜索提示列表的定位出现偏差时，您可以调用此方法对k_typeahead重新进行定位。

### show

show可以让您自己决定在哪些场合展示或隐藏搜索提示列表。它接收一个参数，值为bool值。为true时，列表显示；反之列表隐藏。

## 其它说明

如果您发现bug或有优化建议，请发邮件至285985285@qq.com。

作者： xiek881028

blog: [`bagazhu`](http://www.bagazhu.com)
