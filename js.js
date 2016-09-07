
$(document).on('touchmove',function(ev){
	ev.preventDefault();//取消事件的默认动作
});

/**
 * $(document).ready(function(){.....});//执行时机:在DOM完全就绪时就可以被调用。(这并不意味着这些元素关联的文件都已经下载完毕)
 * $(function(){ do something});
 * $().ready(function(){//do something})
 * 
 * window.onload=function(){}
 * $(window).load(function(){ });	//在网页中所有元素(包括元素的所有关联文件)完全加载到浏览器后才执行	
 */
$(function(){
	var $main = $('#main');
	var $list = $('#list');
	var $li = $list.find('>li');//获取子集元素
	var desW = 640;
	var desH = 960;
	var viewHeight = $(window).height();
	//alert($(window).height());//1137
	$main.css('height',viewHeight);
	
	//加载场景
	showloading();
	
	slideCanvas();
	slideList();
	
	function nowWidth(){//758
		var w = desW/desH * viewHeight;
		return w;
	}
	
	function slideCanvas(){
		var oC = $('#c1').get(0);
		var oGC = oC.getContext('2d');//返回一个用于在画布上绘图的环境。
		var bBtn = true;
		oC.height = viewHeight;
		//alert(oC.width);
		var objImg = new Image();
		objImg.src = '../img/a.png';
		//alert(objImg.width);
		objImg.onload = function (){
			//oGC.drawImage(objImg, 0,0,640,1137);//这样的字体会变形
			oGC.drawImage(objImg, (desW - nowWidth())/2,0,nowWidth(),viewHeight);
			//这样相当于裁切，会有一部分在显示范围外（看场景需求来取舍）
			//在画布上绘制图像、画布或视频  (desW - nowWidth())/2 ，可以使a.png图层居中显示
			//oGC.fillStyle = 'red';//用于绘图、填充
			oGC.globalCompositeOperation = 'destination-out';//destination-out在源图像外显示目标图像。只有源图像外的目标图像部分会被显示，源图像是透明的。
			//globalCompositeOperation 属性设置或返回如何将一个源（新的）图像绘制到目标（已有）的图像上。正好可以实现用画笔擦涂的效果
			oGC.lineWidth = 60;
			oGC.lineCap = 'round';//round绘制圆形的结束线帽：butt 	默认。向线条的每个末端添加平直的边缘。square 	向线条的每个末端添加正方形线帽。
			$(oC).on('touchstart',function(ev){
				var touch = ev.originalEvent.changedTouches[0];
				/**三种在规范中列出并获得跨移动设备广泛实现的基本触摸事件：
					1. touchstart ：手指放在一个DOM元素上。2. touchmove ：手指拖曳一个DOM元素。3. touchend ：手指从一个DOM元素上移开。
					每个触摸事件都包括了三个触摸列表：1. touches ：当前位于屏幕上的所有手指的一个列表。
2. targetTouches ：位于当前DOM元素上的手指的一个列表。3. changedTouches ：涉及当前事件的手指的一个列表。*/
				var x = touch.pageX - $(this).offset().left;
				var y = touch.pageY - $(this).offset().top;
				if(bBtn){
					bBtn = false;
					oGC.moveTo(x,y);//从 x,y开始一条路径
					oGC.lineTo(x+1,y+1);//路径距离
				}
				else{
					oGC.lineTo(x,y);
				}
				oGC.stroke();//stroke() 方法会实际地绘制出通过 moveTo() 和 lineTo() 方法定义的路径。默认颜色是黑色。
				$(oC).on('touchmove.move',function(ev){
					var touch = ev.originalEvent.changedTouches[0];
					var x = touch.pageX - $(this).offset().left;
					var y = touch.pageY - $(this).offset().top;
					oGC.lineTo(x,y);
					oGC.stroke();
				});
				
				$(oC).on('touchend.move',function(){
					//alert(oC.width);
					var dataImg = oGC.getImageData(0,0,oC.width,oC.height);
					//下面的代码通过 getImageData() 复制画布上指定矩形的像素数据，然后通过 putImageData() 将图像数据放回画布：
					var allPx = dataImg.width * dataImg.height;
					var iNum = 0;
					//alert(dataImg.data);
					//alert(dataImg.data[8*4+3] );
					/**
					 * 在这里我使用的是宽320像素，高400像素的canvas画布，因此存在128000个像素点/块，每个像素点由4种基本属性组成，分别是rgba，
					 * 存储了红绿蓝以及透明度的值（这里透明度也是255为完全不透明，和rgb的取值范围相同），
					 * 因此此处共生成了516000个数据，放置在数组当中。如果进行擦除，红绿蓝以及透明度的值均会变成0.
					 * i*4+3这里是取每个像素点的透明度值
					 */
					for(var i=0;i<allPx;i++){
						if(dataImg.data[i*4+3] == 0){
							iNum++;
						}
					}
					if( iNum > allPx/10 ){
						$(oC).animate({opacity:0},1000,function(){
							$(this).remove();
							cjAnimate[0].inAn();
							showMusic();
						});
					}
					$(oC).off('.move');
					//将该命名空间所有事件进行解绑
					//如果使用了jQuery， 那么最好使用它的事件“命名空间”。限定解绑内容，如果不限定，那么off('click')/unbind('click') 会解除所有通过jQuery 绑定的click事件
				});
			});
		};
	}

	function slideList(){
		var downY = 0;
		var step = 1/4;
		var nowIndex = 0;
		var nextorprevIndex = 0;
		var bBtn = true;
		$li.css('backgroundPosition',( (desW - nowWidth())/2 )+'px 0');//图片居中
		$li.on('touchstart',function(ev){
			if(!bBtn){return;}
			bBtn = false;
			var touch = ev.originalEvent.changedTouches[0];
			downY = touch.pageY;
			nowIndex = $(this).index();//返回指定元素相对于其他指定元素的 index 位置。
			//alert(nowIndex);
			$li.on('touchmove',function(ev){
				var touch = ev.originalEvent.changedTouches[0];
				
				$(this).siblings().hide();//获得匹配集合中每个元素的同胞，通过选择器进行筛选是可选的。
				
				if( touch.pageY < downY ){  //↑
					nextorprevIndex = nowIndex == $li.length-1 ? 0 : nowIndex + 1;
					$li.eq(nextorprevIndex).css('transform','translate(0,'+(viewHeight + touch.pageY - downY)+'px)');
				}
				else if( touch.pageY > downY ){  //↓
					//alert(22);
					nextorprevIndex = nowIndex == 0 ? $li.length-1 : nowIndex - 1;
					$li.eq(nextorprevIndex).css('transform','translate(0,'+(-viewHeight + touch.pageY - downY)+'px)');
				}
				else{
					bBtn = true;
				}
				
				//Math.abs(touch.pageY - downY)/viewHeight*step  //-viewHeight~viewHeight
				//0~1  -> 0~0.25
				$li.eq(nextorprevIndex).show().addClass('zIndex');
				$(this).css('transform','translate(0,'+(touch.pageY - downY)*step+'px) scale('+(1-Math.abs(touch.pageY - downY)/viewHeight*step)+')');
				
			});
			
			$li.on('touchend',function(ev){
				var touch = ev.originalEvent.changedTouches[0];
				if( touch.pageY < downY ){  //↑
					$(this).css('transform','translate(0,'+(-viewHeight * step)+'px) scale('+(1-step)+')');
				}
				else if( touch.pageY > downY ){  //↓
					$(this).css('transform','translate(0,'+(viewHeight * step)+'px) scale('+(1-step)+')');
				}
				$(this).css('transition','.3s');
				$li.eq(nextorprevIndex).css('transform','translate(0,0)');
				$li.eq(nextorprevIndex).css('transition','.3s');
			});
			
		});
		
		$li.on('transitionEnd webkitTransitionEnd',function(ev){
			if( $li.is(ev.target) ){//target 属性规定哪个 DOM 元素触发了该事件。
				resetFn();
				
				if(cjAnimate[nowIndex]){
					cjAnimate[nowIndex].outAn();
				}
				if(cjAnimate[nextorprevIndex]){
					cjAnimate[nextorprevIndex].inAn();
				}
				
			}
		});
		
		function resetFn(){
			$li.css('transition','');
			$li.eq(nextorprevIndex).removeClass('zIndex').siblings().hide();
			bBtn = true;
		}	
	}
	
	var cjAnimate = [
		{
			inAn : function(){
				var $liChild = $li.eq(0).find('li');
				$liChild.css('opacity',1);
				$liChild.css('transform','translate(0,0)');
				$liChild.css('transition','1s');
			},
			outAn : function(){
				var $liChild = $li.eq(0).find('li');
				$liChild.css('transition','');
				$liChild.css('opacity',0);
				$liChild.filter(':even').css('transform','translate(-200px,0)');
				$liChild.filter(':odd').css('transform','translate(200px,0)');
			}
		},
		{
			inAn : function(){
				var $liChild = $li.eq(1).find('li');
				$liChild.attr('class','');
				$liChild.css('transform','rotate(360deg)');
				$liChild.css('transition','1s');
			},
			outAn : function(){
				var $liChild = $li.eq(1).find('li');
				$liChild.css('transform','rotate(0)');
				$liChild.css('transition','');
				$liChild.attr('class','active');
			}
		},
		{
			inAn : function(){
				var $divChild = $li.eq(2).find('div');
				$divChild.css('transform','rotateY(720deg)');
				$divChild.css('transition','1s');
			},
			outAn : function(){
				var $divChild = $li.eq(2).find('div');
				$divChild.css('transform','rotateY(0)');
				$divChild.css('transition','');
			}
		},
		{
			inAn : function(){
				var $liChild = $li.eq(3).find('li');
				$liChild.css('transition','1s');
				$liChild.attr('class','');
			},
			outAn : function(){
				var $liChild = $li.eq(3).find('li');
				$liChild.css('transition','');
				$liChild.attr('class','active');
			}
		}
	];	
		
	$.each(cjAnimate,function(i,obj){
		obj.outAn();
	});
	
	function showMusic(){
		var $music = $('#music');
		var $audio1 = $('#audio1');
		var onoff = true;
		$music.on('touchstart',function(){
			if(onoff){
				$(this).attr('class','active');
				$audio1.get(0).play();
			}
			else{
				$(this).attr('class','');
				$audio1.get(0).pause();
			}
			onoff = !onoff;
		});
		$music.trigger('touchstart');//触发被选元素的指定事件类型。
	}
	
	function showloading(){
		var arr = ['a.png','b.png','c.png','d.png','e.png','ad1.png','ad2.png','c1.png','c2.png','c3.png','c4.png','c5.png','c6.png','d1.png'];
		var $loading = $('#loading');
		var iNow = 0;

		for(var i=0;i<arr.length;i++){
			var objImg = new Image();
			objImg.src = 'img/'+arr[i];
			
			objImg.onload = function(){
				//if(iNow  == 0){alert(22);}
				iNow++;
				
				if(iNow == arr.length){
					//加载结束之后隐藏
					$loading.animate({opacity:0},1000,function(){
						$(this).remove();
					});
				}
			};
			objImg.onerror = function(){
				$loading.animate({opacity:0},1000,function(){
					$(this).remove();
				});
			};
		}
	}
	
});