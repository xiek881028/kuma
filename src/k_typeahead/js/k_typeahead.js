/*!
 * k_typeahead
 * xiekai <xk285985285.qq.com>
 * create: 2017/05/10
 * update: 2017/05/18
 * since: 0.1.2
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
		ActiveBg = Ops.activeBg || '#ccc',
		QueryFn = Ops.query || function(){},
		HeightLight = Ops.heightLight || function(){},
		ActiveFn = Ops.activeFn || function(){},
		BuileBase = Ops.buildBase || function(ul){return ul},
		CustomHeightLight = Ops.customHeightLight || '',
		InputShowVal = Ops.inputShowVal || '',

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
		GlobalData = [],
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
			if(Box.addEventListener){
				Box.removeEventListener('mousedown',_this.staticFn.boxMousedown);
				Box.addEventListener('mousedown',_this.staticFn.boxMousedown);
			}else if(Box.attachEvent){
				Box.detachEvent('onmousedown',_this.staticFn.boxMousedown);
				Box.attachEvent('onmousedown',_this.staticFn.boxMousedown);
			};
		},
		showBuild: function(data){//构建列表结构
			if(Object.prototype.toString.call(data) === '[object Array]'){
				var html = '<ul class="k_typeaheadList">',
					argumentsArr = [];
				GlobalData = data;
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
					html += '<li>'+ _this.staticFn.heightLight(SaveVal,listTxt,data[i]) +'</li>';
				};
				html += '</ul>';
				Box.innerHTML = BuileBase(html);
				_this.Fn.show(true);
			}else{
				throw new Error('query的callback接收的第一个参数必须是一个数组');
			};
		},
		heightLight: function(keyword,txt,data){
			if(CustomHeightLight == ''){
				var reg = new RegExp(keyword,"g"),
					custom = HeightLight(keyword);
				txt = txt.toString().replace(reg,(custom == undefined? '<strong>'+ keyword +'</strong>' : custom));
				return txt;
			}else{
				return CustomHeightLight(keyword,txt,data);
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
				liVal = InputShowVal == ''? _this.staticFn.getText(LiList[index]) : InputShowVal(LiList[index], _this.staticFn.getText);
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
		isActiveLi: function(el){
			if(el.nodeName.toLowerCase() == 'li'){
				if(el.parentNode.parentNode.className === Box.className){
					return el;
				}else{
					return _this.staticFn.isActiveLi(el.parentNode);
				};
			}else if(el.nodeName.toLowerCase() != 'li' && el.nodeName.toLowerCase() != 'html'){
				return _this.staticFn.isActiveLi(el.parentNode);
			}else{
				return false;
			};
		},
		index: function(el){
			var _index = 0,
				indexOf;
			indexOf = function(_el){
				if(_el.previousSibling != null){
					_index ++;
					indexOf(_el.previousSibling);
				};
			};
			indexOf(el);
			return _index;
		},
		boxMousedown: function(e){//列表按下事件
			var e = e || event,
				target = e.target?e.target:e.srcElement,
				activeLi = _this.staticFn.isActiveLi(target);
			if(activeLi !== false){//li点击事件
				_element.value = (InputShowVal == ''? _this.staticFn.getText(activeLi) : InputShowVal(activeLi, _this.staticFn.getText));
				ActiveFn(GlobalData, _this.staticFn.index(activeLi), activeLi);
				ActiveLi = true;
				IsActiveNoSearch = true;
			};
		},
		elFocus: function(){//input获得焦点事件
			(SearchEmpty || _element.value) && _this.staticFn.goSearch();
			IsActiveNoSearch = false;
			ActiveLi = false;
		},
		elBlur: function(){//input失去焦点事件
			clearTimeout(Delay);
			_this.Fn.show(false);
			ActiveLi && _element.focus();//选中li后触发blur事件，让input重新获取焦点
			if(UnMoveVal){
				_element.value = UnMoveVal;
				UnMoveVal = '';
			};
		},
		elKeydown: function(e){//input按下事件
			var e = e || event;
			if(+e.keyCode == 38){//方向键上
				if(ActiveIndex > -1){
				ActiveIndex--;
				}else{
					ActiveIndex = GlobalData.length-1;
				};
				GhostAtvIndex = ActiveIndex;
				_this.staticFn.setActiveLi(ActiveIndex);
			}else if(+e.keyCode == 40){//方向键下
				if(ActiveIndex < GlobalData.length-1){
					ActiveIndex++;
				}else{
					ActiveIndex = -1;
				};
				GhostAtvIndex = ActiveIndex;
				_this.staticFn.setActiveLi(ActiveIndex);
			}else if(+e.keyCode == 13){//回车键
				_this.Fn.show(false);
				ActiveFn(GlobalData, GhostAtvIndex, LiList[GhostAtvIndex]);
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
	};
	this.Fn = {
		init : function(){
			if(window.addEventListener){
				_element.removeEventListener('focus',_this.staticFn.elFocus);
				_element.addEventListener('focus',_this.staticFn.elFocus);
				_element.removeEventListener('blur',_this.staticFn.elBlur);
				_element.addEventListener('blur',_this.staticFn.elBlur);
				_element.removeEventListener('keyup',_this.staticFn.elKeyup);
				_element.addEventListener('keyup',_this.staticFn.elKeyup);
				_element.removeEventListener('keydown',_this.staticFn.elKeydown);
				_element.addEventListener('keydown',_this.staticFn.elKeydown);
				window.addEventListener('resize',_this.Fn.position);
			}else if(window.attachEvent){
				_element.detachEvent('onfocus',_this.staticFn.elFocus);
				_element.attachEvent('onfocus',_this.staticFn.elFocus);
				_element.detachEvent('onblur',_this.staticFn.elBlur);
				_element.attachEvent('onblur',_this.staticFn.elBlur);
				_element.detachEvent('onkeyup',_this.staticFn.elKeyup);
				_element.attachEvent('onkeyup',_this.staticFn.elKeyup);
				_element.detachEvent('onkeydown',_this.staticFn.elKeydown);
				_element.attachEvent('onkeydown',_this.staticFn.elKeydown);
				window.attachEvent('onresize',_this.Fn.position);
			};
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
