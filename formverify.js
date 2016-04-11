/**
 * 表单验证类
 * @param object
 * @return bool
 * @auther guost
 */
var formVerify	=	function(form , opts){
	this.construct	=	{
		iptdom			:	'',		//要验证码的inputdom
		tipstype		:	'default',	//提示信息使用方式default:不适用任何框架直接输出，bs:bootstrap,layer三个选择
		layerdom		:	'',		//layer显示在指定的dom之后
		iptvalue		:	'',		//要验证的input的值
		/*验证规则包含
		*url链接地址,
		*email邮箱,
		*tel手机号码,
		*phone座机号码,
		*number数字,
		*plus非负数,
		*negative负数,
		*date日期,
		*mixString(中文数字字母下划线),
		*name(中文或英文),
		*chinese(汉字),
		*workage(18-65的数字),
		*cnumber(汉字或数字),
		*idcard身份证
		*/
		verifyType			:	'text',	//进行验证的规则
		relateIptDom		:	'',		//string 关联验证的ipt
		relateIptPropValue	:	'',		//string 需要验证的ipt属性类型
		lengthMinLimit		:	0,		//nuber 字符最小长度 0-表示不限
		lengthMaxLimit		:	0,		//number 字符最大长度 0-表示不限
		ajax_url			:	'',		//ajax验证的服务器地址
		ajax_callback		:	'',		//ajax返回值的js比对函数
		errno				:	400500,	//number 验证结果的错误编号，0表示没有错误
		errMsg				:	'表单内容不能为空',		//string 验证结果的错误信息
		cssOpts_right		:	{"color":"#11cd6e",'position':'absolute','width':'auto','font-size':'12px','float':'none','display':'inline-block','text-align':'left'},//为默认的正确输出项
		cssOpts_wrong		:	{"color":"#ed1b24",'position':'absolute','width':'auto','font-size':'12px','float':'none','display':'inline-block','text-align':'left'}//为默认的错误输出项
	}
	this.error	=	{
		0		:	'验证成功',
		400000	:	'',	//自定义的错误提示
		400001	:	'输入内容不能为空',
		400002	:	'您输入的内容长度太短',
		400003	:	'您输入的内容长度过长',
		400004	:	'此项必须被勾选',
		400005	:	'请选择一个选项',
		400101	:	'您输入的链接格式错误',
		400102	:	'您输入的邮箱格式错误',
		400103	:	"您输入的电话号码格式错误",
		400104	:	"您输入的座机号码格式错误",
		400105	:	'请输入0-9的数字',
		400106	:	'请输入0-9的非负数',
		400107	:	'请输入0-9的负数',
		400108	:	'您输入的时间格式错误',
		400109	:	'请输入中文字母数字(含下划线)格式的内容',
		400201	:	"您两次输入的内容不一致",
		400202  :   "只能输入汉字或英文",
		400203  :   "只能输入汉字",
		400204  :   "只能输入18-65的数字",
		400205  :   "只能输入汉字或数字",
		400206	:	'请输入有效的身份证号码'
	}
	/*使用默认方式提示，如果有错误聚焦时清空*/
	this.default_beforeVerify	=	function(ipt){
		this.initErr( ipt );
		$(ipt).siblings('i,.help-inline').remove();
	}
	/*css框架使用bootstrap的错误提示,如果此行有错误提示，聚焦时清空*/
	this.bs_beforeVerify	=	function(ipt){
		this.initErr( ipt );
		$(ipt).parents('.control-group').removeClass('error success');
	}
	/*css框架使用layer的错误提示,聚焦时关闭*/
	this.layer_beforeVerify	=	function(ipt){
		this.initErr( ipt );
		//关闭掉之前可能已经展示出来的layer
		var index	=	$(ipt).attr('layer_index');
		if( index ){
			layer.close( index );
		}
		//关闭掉之前关联dom的layer
		var relationDom	=	$(ipt).attr('relation-dom');
		if( typeof( relationDom ) != 'undefined'){
			var relationLayerIndex	=	$(relationDom).attr('layer_index');
			if( typeof( relationLayerIndex ) != 'undefined' ){
				layer.close( relationLayerIndex );
			}
		}
	}
	this.initErr	=	function( ipt ){
		$.extend( this.construct , { errno : 0 , errMsg : this.error[0] } );
		$(ipt).attr( 'errno' , 0 );
	}
	/*验证初始化*/
	this.init	=	function(ipt){
		$.extend( this.construct , { iptdom : ipt } );
		/*获取多选是否是必须勾选项*/
		var need_checked	=	$(ipt).attr('verify-checked');
		if( typeof( need_checked ) != 'undefined' ){
			if( ipt.checked == false ){
				$.extend(this.construct , { errno:400004 , errMsg : this.error[400004] });
			}
		}
		//获取验证的最大最小长度
		var lengthMinLimit	=	$(ipt).attr('verify-minLen');
		if( typeof(lengthMinLimit) != 'undefined' ){
			$.extend(this.construct , { lengthMinLimit:lengthMinLimit });
		}
		else{
			$.extend(this.construct , {lengthMinLimit:0});
		}
		var lengthMaxLimit	=	$(ipt).attr('verify-maxLen');
		if( typeof(lengthMaxLimit) != 'undefined' ){
			$.extend(this.construct , {lengthMaxLimit:lengthMaxLimit});
		}
		else{
			$.extend(this.construct , {lengthMaxLimit:0});
		}
		//获取关联的dom
		relateIptDom	=	$(ipt).attr('relation-dom');
		if( typeof(relateIptDom) != 'undefined' ){
			var relaProp	=	$(ipt).attr('relation-prop');
			if( typeof( relaProp ) != 'undefined' ){
				relateIptPropValue	=	$(relateIptDom).attr(relaProp);
			}
			else{
				relateIptPropValue	=	$(relateIptDom).val();
			}
			$.extend(this.construct , {relateIptDom:relateIptDom ,relateIptPropValue:relateIptPropValue});
		}
		else{
			$.extend(this.construct , {relateIptDom:'' ,relateIptPropValue:''});
		}
		//获取验证的类型
		verifyType	=	$(ipt).attr('verify-type');
		if( typeof(verifyType) != 'undefined' ){
			$.extend(this.construct , {verifyType:verifyType});
		}
		else{
			$.extend(this.construct , {verifyType:''});
		}
		iptValue	=	$(ipt).val();
		$.extend( this.construct , { iptvalue : iptValue } );
		var verifyRequired	=	$(ipt).attr('required'); 
		if( verifyRequired && iptValue.length == 0 ){
			$.extend( this.construct , { errno : 400001 , errMsg : this.error[400001] } ); 
		}
		//获取验证的ajax参数
		var ajax_url	=	$(ipt).attr('ajax-url');
		var ajax_callback=	$(ipt).attr('ajax-callback');
		if( typeof(ajax_url) != 'undefined' ){
			$.extend(this.construct , {ajax_url:ajax_url});
		}
		else{
			$.extend(this.construct , {ajax_url:''});
		}
		//获取layer显示的dom元素
		var layerdom	=	$(ipt).attr('verify-layer-dom');
		if( typeof(layerdom) == 'undefined' ||  layerdom == false ){
			layerdom	=	ipt;
		}
		$.extend( this.construct , {'layerdom':layerdom} );
	}
	/*验证字符长度*/
	this.verifyLength	=	function(){
		var prop	=	this.construct;
		if (prop.errno	> 0 )  return;
		if( prop.lengthMinLimit > 0 ){
			if( prop.iptvalue.length < prop.lengthMinLimit ){
				$.extend( this.construct , {errno : 400002 , errMsg : this.error[400002]} );
				return;
			}
		}
		if( prop.lengthMaxLimit > 0 ){
			if( prop.iptvalue.length > prop.lengthMaxLimit ){
				$.extend( this.construct , {errno : 400003 , errMsg : this.error[400003] } );
				return;
			}
		}
	}
	/*验证字符类型*/
	this.verifyType	=	function(){
		var prop	=	this.construct;
		if (prop.errno	> 0 )  return;
		var preg,err_no;
		switch( prop.verifyType ){
			case 'url':
				preg = /^((http|https):\/\/)?([\w-]+\.)+[\w-]+([\w-./?%&=]*)?$/i;
				err_no	=	400101;
				break;
			case 'email':
				preg = /^[a-z0-9]+([._\\-]*[a-z0-9])*@([a-z0-9]+[-a-z0-9]*[a-z0-9]+.){1,63}[a-z0-9]+$/i;
				err_no	=	400102;
				break;
			case 'tel':
				preg = /^1[3|4|5|8|7]\d{9}$/i;
				err_no = 400103;
				break;
			case 'phone':
				preg = /^(\d{4}-)?(\d{8}|\d{7})$/i;
				err_no = 400104;
				break;
			case 'number':
				preg = /^[0-9]*$/i;
				err_no = 400105;
				break;
			case 'plus':
				preg = /^\d+$/i;
				err_no = 400106;
				break;
			case 'date':
				preg = /^(\d{4})(-)(\d{1,2})(-)(\d{1,2})$/i;
				err_no = 400108;
				break;
			case 'mixString':
				preg = /^[\u4E00-\u9FA5-\A-Za-z0-9_]+$/i;
				err_no = 400109;
				break;
			case 'name':
				preg = /^[\u4E00-\u9FA5-\A-Za-z]+$/i;
				err_no = 400202;
				break;
			case 'chinese':
				preg = /^[\u4E00-\u9FA5]+$/i;
				err_no = 400203;
				break;
			case 'workage':
				preg = /1[8-9]|[2-5]\d|6[1-5]/i;
				err_no = 400204;
				break;
			case 'cnumber':
				preg = /^[\u4E00-\u9FA5-\0-9]+$/i;
				err_no = 400205;
				break;
			case 'idcard':
				preg = /^(\d{15}$|^\d{18}$|^\d{17}(\d|X|x))$/i;
				err_no = 400206;
				break;
			default:
				break;
		}
		if( preg && preg.test( prop.iptvalue ) == false ){
			$.extend( this.construct , {errno : err_no , errMsg : this.error[err_no]} );
		}
		else{
			$.extend( this.construct , {errno : 0 , errMsg : this.error[0]} );
		}
	}
	/*验证是否有上下级关联*/
	this.verifyRelation	=	function(){
		var prop	=	this.construct;
		if (prop.errno > 0)  return;
		if( prop.relateIptDom && prop.relateIptPropValue != prop.iptvalue && false != prop.iptvalue && false != prop.relateIptPropValue ){
			$.extend( this.construct , {errno : 400201 , errMsg : this.error[400201]} );
			return;
		}else if( false == prop.iptvalue && prop.relateIptDom ){
			//关联类型的输入内容默认不能为空
			$.extend( this.construct , {errno : 400001 , errMsg : this.error[400001]} );
			return;
		}
	}
	/*验证是否使用ajax*/
	this.verify_ajax	=	function(){
		var prop	=	this.construct;
		if ( prop.errno > 0 || false == prop.ajax_url )  return;
		if( false != prop.ajax_url && false != prop.iptvalue ){
			layer.load();
			$.ajax({
				url			:	prop.ajax_url+prop.iptvalue,
				dataType	:	'json',
				async		:	false,
				success		:	function(res){
					layer.closeAll('loading');
					if( res.status == 1 ){
						$.extend( that.construct , {errno : 0 , errMsg : that.error[0] } );
					}
					else if( res.status == 0 ){
						$.extend( that.construct , {errno : 400000 , errMsg : res.message } );
						$.extend( that.error , {400000:res.message} );
					}
				}
			})
		}
	}
	/*使用默认方式输出验证结果*/
	this.default_verifyResponse	=	function(ipt){
		var prop	=	this.construct;
		var notice_span	=	$(prop.layerdom).siblings('.help-inline');
		if( notice_span.length == 0 ){
			$(prop.layerdom).after('<i class="icon icon_right"></i><span class="help-inline"></span>');
		}	
		if( prop.errno == 0 ){
			$(prop.layerdom).siblings('.help-inline').text(prop.errMsg).css( prop.cssOpts_right );
			$(prop.layerdom).siblings('i').removeClass('icon_wrong').addClass('icon_right');
			return;
		}
		$(prop.layerdom).siblings('.help-inline').css( prop.cssOpts_wrong );
		$(prop.layerdom).siblings('i').removeClass('icon_right').addClass('icon_wrong');
		$(prop.layerdom).siblings('.help-inline').text(prop.errMsg);
		$(ipt).attr('errno',prop.errno);
	}
	/*输出验证结果，使用bootstrap输入格式*/
	this.bs_verifyResponse	=	function(ipt){
		var prop	=	this.construct;
		var notice_span	=	$(prop.layerdom).siblings('.help-inline');	
		if( notice_span.length == 0 ){
			$(prop.layerdom).parent().append('<i class="icon_tick_green"></i><span class="help-inline"></span>');
		}	
		if( prop.errno == 0 ){
			$(prop.layerdom).parents('.control-group').addClass('success');		
			$(prop.layerdom).siblings('.help-inline').text(prop.errMsg);
			$(prop.layerdom).siblings('i').removeClass().addClass('icon_tick_green');
			return;
		}
		$(prop.layerdom).parents('.control-group').addClass('error');
		$(prop.layerdom).siblings('.help-inline').css({"font-size":"12px"});
		$(prop.layerdom).siblings('i').removeClass().addClass('icon_cross_green');
		$(prop.layerdom).siblings('.help-inline').text(prop.errMsg);
	}
	/*输出验证结果，使用layer输出格式*/
	this.layer_verifyResponse	=	function(ipt){
		var prop	=	this.construct;
		var color	=	0 == prop.errno ? '#51a351' : '#ed1b24';
		var index	=	layer.tips( prop.errMsg, prop.layerdom , { time:0 , tipsMore:true ,tips:[2,color],area:['250px','28px'] } );
		$(ipt).attr('layer_index',index).attr('errno',prop.errno);
		$(prop.layerdom).attr( 'layer_index',index );
		if( prop.relateIptDom ){
			var index	=	layer.tips( prop.errMsg, prop.relateIptDom , { time:0 , tipsMore:true ,tips:[2,color],area:['250px','28px'] } );
			$( prop.relateIptDom ).attr('layer_index',index).attr('errno',prop.errno);
		}
	}
	/*验证开始入口*/
	this.verify	=	function(ipt){
		this.init(ipt);
		this.verifyLength();	//验证长度
		this.verifyType();		//验证表单类型
		this.verifyRelation();	//验证表单的关联类型
		this.verify_ajax();
		this.default_verifyResponse(ipt);
	}
	/*开始提交表单信息*/
	this.beforeSubmitForm	=	function(){
		var flag	=	true;
		$(form).find('input,textarea').each(function(){
			var errno	=	$(this).attr('errno');
			var require	=	$(this).attr('required');
			var relateIptDom	=	$(this).attr('relation-dom');
			/*获取单选是否被选中了一个*/
			var name	=	$(this).attr('name');
			var need_checked	=	$('input[name='+ name +']').eq(0).attr('verify-checked');
			if( typeof( need_checked ) != 'undefined' ){
				var ischecked	=	false;
				$('input[name='+ name +']').each(function(){
					if( $(this).get(0).checked ){
						ischecked	=	true;
						return false;
					}
				})
				if( ischecked == false ){
					flag	=	false;
					$(this).siblings('i,.help-inline').remove();
					$(this).parent().append('<i class="icon icon_wrong"></i><span class="help-inline">'+ that.error['400005'] +'</span>');
					$(this).siblings('.help-inline').css( that.construct.cssOpts_wrong );
					$(this).siblings('i').removeClass('icon_right').addClass('icon_wrong');
					return false;
				}
			}
			//添加非必填项判断
			if( typeof( errno ) == 'undefined'  ){
				if( typeof( require ) != 'undefined' || typeof( relateIptDom ) != 'undefined' ){
					flag	=	false;
					$(this).siblings('i,.help-inline').remove();
					$(this).parent().append('<i class="icon icon_wrong"></i><span class="help-inline">请输入表单内容</span>');
					$(this).siblings('.help-inline').css( that.construct.cssOpts_wrong );
					$(this).siblings('i').removeClass('icon_right').addClass('icon_wrong');
					return false;
				}
				else{
					return;
				}
			}else if( errno > 0 ){
				if($(this).siblings('.help-inline').length == 0){
					$(this).parent().append('<i class="icon"></i><span class="help-inline"></span>');
				}
				$(this).siblings('.help-inline').css( that.construct.cssOpts_wrong );
				$(this).siblings('i').removeClass('icon_right').addClass('icon_wrong');
				$(this).siblings('.help-inline').text(that.error[errno]);
				flag	=	false;
				return false;
			}else if( errno == 0 ) return ;
		})
		if( !flag ) return false; else $(form).submit();
	}
	/*使用键盘事件提交表单*/
	this.keySubmit	=	function(){
		var keycode	=	event.keyCode|| event.which;
		if( keycode == 13 ){
			that.beforeSubmitForm();
		}
	}
	var that	=	this;
	$(form).find('input,textarea').focus(function(){
		that.default_beforeVerify(this);
	})
	$(form).find('input,textarea').blur(function(){
		that.verify(this);
	})
	$(form).find('button[type=submit],input[type=submit],.btn_smt').click(function(){
		that.beforeSubmitForm();
	})
	if( document.addEventListener ){
		document.addEventListener('keydown' , that.keySubmit , false );
	}
	else if( document.attachEvent ){
		document.attachEvent( 'onkeydown' , that.keySubmit , false );
	}
}
