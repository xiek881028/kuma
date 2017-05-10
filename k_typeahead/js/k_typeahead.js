/*!
 * k_typeahead
 * xiekai <xk285985285.qq.com>
 * create: 2017/05/10
 * since: 0.0.1
 */
window.k_typeahead = function k_typeahead(element, ops){
	var _this = this,
		_element = element,

		Ops = ops || {},
		WinHeight = Ops.height || 'auto',
		WinWidth = Ops.width || _element.offsetWidth,
		Timer = Ops.timer || 500,
		MaxList = Ops.maxList || 10,
		BuildList = Ops.buildList,
		SearchEmpty = Ops.searchEmpty || false,
		ClassName = Ops.className || '',
		QueryFn = Ops.query || function(){},
		HeightLight = Ops.heightLight || function(){},
		ActiveFn = Ops.activeFn || function(){},
		BuileBase = Ops.buildBase || function(ul){return ul},
		CustomHeightLight = Ops.customHeightLight || '',

		Delay,
		LiList,
		Box = document.createElement("div"),
		ActiveLi = false,
		IsActiveNoSearch = false,
		ActiveIndex = -1,
		GhostAtvIndex = -1,
		SaveData = {},
		UnMoveVal = '',
		SaveVal = '',
		OldVal = '';
	this.staticFn = {
		buildBase: function(){//构建基础结构
			Box.className = 'k_typeahead' + (ClassName? ' '+ClassName:'');
			Box.style.width = WinWidth+'px';
			Box.style.height = typeof(WinHeight)=='string'?WinHeight:WinHeight+'px';
			Box.style.position = 'absolute';
			Box.style.display = 'none';
			_this.Fn.position();
			_element.parentNode.appendChild(Box);
			Box.addEventListener('mousedown',_this.staticFn.boxMousedown);
		},
		showBuild: function(data){//构建列表结构
			if(Object.prototype.toString.call(data) === '[object Array]'){
				var html = '<ul class="k_typeaheadList">',
					argumentsArr = [];
				ListData = data;
				if(SaveData[SaveVal] == undefined){
					SaveData[SaveVal] = data;
				};
				ActiveIndex = -1;
				for(var j=0,_max=arguments.length; j<_max; j++){
					argumentsArr.push(arguments[j]);
				};
				for(var i=0,max=data.length<MaxList?data.length:MaxList;i<max;i++){
					var callData = [i],
						listTxt = '';
					callData = callData.concat(argumentsArr);
					listTxt = BuildList==undefined?data[i]:BuildList.apply(this,callData);
					html += '<li title='+ data[i] +'>'+ _this.staticFn.heightLight(SaveVal,listTxt) +'</li>';
				};
				html += '</ul>';
				Box.innerHTML = BuileBase(html);
				_this.Fn.show(true);
			}else{
				throw new Error('query的callback接收的第一个参数必须是一个数组');
			};
		},
		heightLight: function(keyword,txt){
			if(CustomHeightLight == ''){
				var reg = new RegExp(keyword,"g"),
					custom = HeightLight(keyword);
				txt = txt.toString().replace(reg,(custom == undefined? '<strong>'+ keyword +'</strong>' : custom));
				return txt;
			}else{
				return CustomHeightLight(keyword,txt);
			};
		},
		goSearch: function(){//搜索方法
			clearTimeout(Delay);
			if(SearchEmpty?true:_element.value != '' && !IsActiveNoSearch){
				SaveVal = _element.value;
				if(SaveData[SaveVal] != undefined){
					_this.staticFn.showBuild(SaveData[SaveVal]);
					return;
				};
				Delay = setTimeout(function(){
					QueryFn(_element.value, _this.staticFn.showBuild);
				},Timer);
			}
		},
		setActiveLi: function(index){//设置选中li
			var liVal = '';
			for(var i=0,max=Box.childNodes.length; i<max; i++){
				var _child = Box.childNodes[i];
				if(_child.nodeName.toLowerCase() == 'ul' && _child.className == 'k_typeaheadList'){
					LiList = _child.childNodes;
				};
			};
			UnMoveVal = SaveVal;
			for(var i=0,max=LiList.length; i<max; i++){
				LiList[i].className = '';
			};
			if(index != -1){
				LiList[index].className = 'active';
				liVal = _this.staticFn.getText(LiList[index]);
			}else{
				liVal = SaveVal;
			};
			_element.value = liVal;
		},
		getText: function(el){
			var text = '';
			el = el.childNodes || el;
			for(var i=0,max=el.length; i<max; i++){
				text += (el[i].nodeType != 1 ? el[i].nodeValue.replace(/[\s]/g,'') : _this.staticFn.getText(el[i].childNodes));
			};
			return text;
		},
		boxMousedown: function(e){//列表按下事件
			var e = e || event;
			if(e.target.nodeName.toLowerCase() == 'li' && e.target.parentNode.parentNode.className == 'k_typeahead'){//li点击事件
				_element.value = _this.staticFn.getText(e.target);
				ActiveFn(e.target);
				ActiveLi = true;
				IsActiveNoSearch = true;
			};
		},
		elFocus: function(bool){//input焦点事件
			if(bool){
				(SearchEmpty || _element.value) && _this.staticFn.goSearch();
				IsActiveNoSearch = false;
				ActiveLi = false;
			}else{
				clearTimeout(Delay);
				_this.Fn.show(false);
				ActiveLi && _element.focus();//选中li后触发blur事件，让input重新获取焦点
				if(UnMoveVal){
					_element.value = UnMoveVal;
					UnMoveVal = '';
				};
			};
		},
		elKeydown: function(e){//input按下事件
			var e = e || event;
			if(+e.keyCode == 38){//方向键上
				if(ActiveIndex > -1){
				ActiveIndex--;
				}else{
					ActiveIndex = ListData.length-1;
				};
				GhostAtvIndex = ActiveIndex;
				_this.staticFn.setActiveLi(ActiveIndex);
			}else if(+e.keyCode == 40){//方向键下
				if(ActiveIndex < ListData.length-1){
					ActiveIndex++;
				}else{
					ActiveIndex = -1;
				};
				GhostAtvIndex = ActiveIndex;
				_this.staticFn.setActiveLi(ActiveIndex);
			}else if(+e.keyCode == 13){//回车键
				_this.Fn.show(false);
				ActiveFn(LiList[GhostAtvIndex]);
				UnMoveVal = '';
			};
		},
		elKeyup: function(e){//input按完事件
			var e = e || event;
			if(e.keyCode != 38 && e.keyCode != 40 && e.keyCode != 13){
				if(_element.value == '' && !SearchEmpty){
					_this.Fn.show(false);
				}else{
					OldVal != _element.value && _this.staticFn.goSearch();
				};
			};
			OldVal = _element.value;
		},
	},
	this.Fn = {
		init : function(){
			_element.removeEventListener('focus',_this.staticFn.elFocus);
			_element.addEventListener('focus',_this.staticFn.elFocus.bind(this, true));
			_element.removeEventListener('blur',_this.staticFn.elFocus);
			_element.addEventListener('blur',_this.staticFn.elFocus.bind(this, false));
			_element.removeEventListener('keyup',_this.staticFn.elKeyup);
			_element.addEventListener('keyup',_this.staticFn.elKeyup);
			_element.removeEventListener('keydown',_this.staticFn.elKeydown);
			_element.addEventListener('keydown',_this.staticFn.elKeydown);
			window.addEventListener('resize',_this.Fn.position);
			_this.staticFn.buildBase();
		},
		position: function(){
			Box.style.left = _element.offsetLeft +'px';
			Box.style.top = (_element.offsetTop+_element.offsetHeight) +'px';
		},
		show: function(bool){
			Box.style.display = bool?'inherit':'none';
			ActiveIndex = -1;
		},
	};
	this.Fn.init();
	return this.Fn;
}
