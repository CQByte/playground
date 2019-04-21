function initMap(id) {
	var myChart = null;
	var _mapLevel = 1;
	var _province = null;
	var mapLoaded = {};   // 已加载地图
	var mapLoading = false;

	// 地图配置
	var optionMap = {
		title: {
			text: '省市区穿梭 demo',
			left: 'center'
		},
		geo: {
			map: 'china'
		}
	}

	// 动态重绘
	window.addEventListener('resize', function () {
		myChart.resize()
	})

	// 返回上一级
	function navBack(ev) {
		if(_province){
			if(_province.city){
				getMapData(2, _province.name)
			}else{
				getMapData(1)
			}
		}
	}

	var wrapper = document.getElementById(id);
	wrapper.style.position = 'relative';
	wrapper.innerHTML = '<a style="display:none;right:50px;top:50px;position:absolute;z-index:9;" id="dev_map_btn" href="javascript:void(0)">返回上级</a><div id="dev_map"></div>'
	var btnBack = wrapper.querySelector('#dev_map_btn');
	btnBack.onclick = navBack;
	var container = wrapper.querySelector('#dev_map');
	container.setAttribute('style', 'position: absolute;top:0;right:0;bottom:0;left:0;')
	myChart = echarts.init(container, 'dark');
	getMapData(1);

	/**
	 * 处理点击地图上所有点击事件
	 */
	myChart.on('click', function (ev) {
		if(mapLoading) return;
		if(_province){
			if(_province.city){
				console.log('木有下载')
			}else{
				getMapData(3, ev.name);
			}
		}else{
			getMapData(2, ev.name.replace(/[省,市]/, ''));  // 点击区域名称
		}
	})

	/**
	 * 加载地图数据
	 * @param level 地图层级：1 全国 2 省级 3 市级
	 * @param name  省/市名称
	 */
	function getMapData(level, name) {
		name = name || 'china'
		var code; // 点击区域代码
		var url;  // 请求点击区域地图数据url地址
		switch (level) {
			case 1: // 加载全国地图
				optionMap.title.subtext = '';
				optionMap.geo.map = name
				myChart.setOption(optionMap)
				btnBack.style.display = 'none'
				_province = null;
				return;
			case 2:  // 加载省级地图
				code = provinceCode[name];
				url =  "geometryProvince/" + code + ".json";
				_province = {
					name: name,
					code: code,
					back: false
				}
				break;
			case 3:  // 加载市级地图
				code = regionCode[name];
				console.log(code)
				url =  "geometryCouties/" + code + ".json";
				_province.city = name;
				break;
			default: return;
		}
		//从已加载地图中查找缓存
		if(mapLoaded[code]){
			optionMap.geo.map = code;
			optionMap.title.subtext = name;
			myChart.setOption(optionMap);
			_mapLevel = level;
			mapLoading = false;
		}else{
			$.ajax({
				url: url,
				data:'',
				dataType: "json", 
				success: function (json) {
					echarts.registerMap(code, json);
					optionMap.geo.map = code;
					optionMap.title.subtext = name;
					myChart.setOption(optionMap);
					_mapLevel = level;
					mapLoading = false;
				},
				error: function (e) {
					navBack()
					alert('下载失败额')
					mapLoading = false;
				}
			});
		}
		btnBack.style.display = 'inline'
	}
	return optionMap;
}
