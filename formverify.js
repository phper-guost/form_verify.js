/**
 * 表单验证类
 * @param object
 * @return bool
 * @auther guost
 */
var formVerify	=	function(form){
	this.construct	=	{
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
		*/
		verifyType			:	'text',	//进行验证的规则
		relateIptDom		:	'',		//string 关联验证的ipt
		relateIptPropValue	:	'',		//string 需要验证的ipt属性类型
		lengthMinLimit		:	0,		//nuber 字符最小长度 0-表示不限
		lengthMaxLimit		:	0,		//number 字符最大长度 0-表示不限
		ajax_url			:	'',		//ajax验证的服务器地址
		ajax_callback		:	'',		//ajax返回值的js比对函数
		errno				:	400500,	//number 验证结果的错误编号，0表示没有错误
		errMsg				:	'表单内容不能为空'		//string 验证结果的错误信息
	}
	this.error	=	{
		0		:	'验证成功',
		40000	:	'',	//自定义的错误提示
		400001	:	'输入内容不能为空',
		400002	:	'您输入的内容长度太短',
		400003	:	'您输入的内容长度过长',
		400101	:	'您输入的链接格式错误，例：http://www.example.com',
		400102	:	'您输入的邮箱格式错误，例：example@example.com',
		400103	:	"您输入的电话号码格式错误，例：15887654321",
		400104	:	"您输入的座机号码格式错误，例：0371-12345678",
		400105	:	'请输入0-9的数字',
		400106	:	'请输入0-9的非负数',
		400107	:	'请输入0-9的负数',
		400108	:	'您输入的时间格式错误,例：2015-01-01',
		400109	:	'请输入中文字母数字(含下划线)格式的内容',
		400201	:	"您两次输入的内容不一致",
		400202  :   "只能输入汉字或英文",
		400203  :   "只能输入汉字",
		400204  :   "只能输入18-65的数字",
		400205  :   "只能输入汉字或数字"
	}
	/*css框架使用bootstrap的错误提示,如果此行有错误提示，聚焦时清空*/
	this.bs_beforeVerify	=	function(ipt){
		$(ipt).parents('.control-group').removeClass('error success');	//
	}
	/*css框架使用layer的错误提示,聚焦时关闭*/
	this.layer_beforeVerify	=	function(ipt){
		this.initErr( ipt );
		var index	=	$(ipt).attr('layer_index');
		if( index ){
			layer.close( index );
		}
	}
	this.initErr	=	function(){
		$.extend( this.construct , { errno : 0 , errMsg : this.error[0] } );
	}
	/*验证初始化*/
	this.init	=	function(ipt){		
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
		if( prop.relateIptDom && prop.relateIptPropValue != prop.iptvalue && false != prop.iptvalue ){
			$.extend( this.construct , {errno : 400201 , errMsg : this.error[400201]} );
			return;
		}
		else if( false == prop.iptvalue ){
			//关联类型的输入内容默认不能为空
			$.extend( this.construct , {errno : 400001 , errMsg : this.error[400001]} );
			return;
		}
	}
	/*验证是否使用ajax*/
	this.verify_ajax	=	function(){
		var prop	=	this.construct;
		if (prop.errno > 0)  return;
		$.ajax({
			url			:	prop.ajax_url+prop.iptvalue,
			dataType	:	'json',
			ansyc		:	false,
			success		:	function(res){
				if( res.status == 1 ){
					$.extend( that.construct , {errno : 0 , errMsg : this.error[0] } );
					return;
				}
				else if( res.status == 0 ){
					$.extend( that.construct , {errno : 400000 , errMsg : res.message } );
					return;
				}
			}
		})
	}
	/*输出验证结果，使用bootstrap输入格式*/
	this.bs_verifyResponse	=	function(ipt){
		var prop	=	this.construct;
		var notice_span	=	$(ipt).siblings('.help-inline');	
		if( notice_span.length == 0 ){
			$(ipt).after('<i class="icon_tick_green"></i><span class="help-inline"></span>');
		}	
		if( prop.errno == 0 ){
			$(ipt).parents('.control-group').addClass('success');		
			$(ipt).siblings('.help-inline').text(prop.errMsg);
			$(ipt).siblings('i').removeClass().addClass('icon_tick_green');
			return;
		}
		$(ipt).parents('.control-group').addClass('error');
		$(ipt).siblings('.help-inline').css({"font-size":"12px"});
		$(ipt).siblings('i').removeClass().addClass('icon_cross_green');
		$(ipt).siblings('.help-inline').text(prop.errMsg);
	}
	/*输出验证结果，使用layer输出格式*/
	this.layer_verifyResponse	=	function(ipt){
		var prop	=	this.construct;
		var color	=	0 == prop.errno ? '#51a351' : '#ed1b24';
		var index	=	layer.tips( prop.errMsg, ipt , { time:0 , tipsMore:true ,tips:[2,color],area:['250px','30px'] } );
		$(ipt).attr('layer_index',index);
		if( prop.relateIptDom ){
			var index	=	layer.tips( prop.errMsg, prop.relateIptDom , { time:0 , tipsMore:true ,tips:[2,color],area:['250px','30px'] } );
			$(prop.relateIptDom).attr('layer_index',index);
		}
	}
	/*验证开始入口*/
	this.verify	=	function(ipt){
		this.init(ipt);
		this.verifyLength();	//验证长度
		this.verifyType();		//验证表单类型
		this.verifyRelation();	//验证表单的关联类型
		this.verify_ajax();
		this.layer_verifyResponse(ipt);
	}
	that	=	this;
	$(form).find('input,textarea').focus(function(){
		that.layer_beforeVerify(this);
	})
	$(form).find('input,textarea').blur(function(){
		that.verify(this);
	})
	$(form).find('button[type=submit],input[type=submit]').click(function(){
		if( that.construct.errno > 0 ){
			return false;
		}
		else{
			$(form).submit();
		}
	})
}
