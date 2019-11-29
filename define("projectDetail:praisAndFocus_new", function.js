define("projectDetail/praisAndFocus_new", function (require, exports, module) {
    var projectId = $("#projectId").val();
    var isPraiseHidden = $("#isPraiseHidden").val();
    var isTopicHidden = $("#isTopicHidden").val();
    
    function praisAndFocus() {
        jQuery.ajax({
            url: "//"+window.location.host+"/get_loginuser.action?temp=" + Math.random(),
            cache: "false",
            dataType: "text",
            scriptCharset: "utf-8",
            success: function (msg) {
                $("#user_pin").val(msg);
                showUser();
                isFocus(projectId,msg);
                if(isPraiseHidden=="true"){
                	$("#a_focus").removeClass("follow").addClass("not-follow").children("span");
                    $("#focusCount").html("");
                    $("#a_prais").removeClass("praise").addClass("not-praise").children("span");
                    $("#praisCount").html("");
                    return;
                }
                //获取关注数量
                $.getJSON("//sq.jr.jd.com/collectionList?key=1000&pin="+msg+"&systemId="+projectId+"&likeType=3&status=10&callback=?", function (data, e) {
                    console.log("关注项目数1",data.data);
                    if (data == null || data.data["focus"] == null || data.data["focus"] == undefined) {
                        //变成未关注,未赞的样式,数字显示为0
                        $("#a_focus").removeClass("follow").addClass("not-follow").children("span");
                        $("#focusCount").html("(0)");
                        $("#a_prais").removeClass("praise").addClass("not-praise").children("span");
                        $("#praisCount").html("(0)");
                    } else {
                        $("#focusCount").html("(" + show_num(data.data["focus"]) + ")");
                        var key = $.cookie('Praise_System_Id_' + projectId);
                        if (key) {
                            //已赞
                            $("#a_prais").removeClass("not-praise").addClass("praise");
                            $("#prais").html("已赞");
                        }
                    }

                });
                //获取点赞数
                $.getJSON("//sq.jr.jd.com/cm/getCount?key=1000&systemId=" + projectId + "&pin=" + msg + "&callback=?&temp=" + Math.random(),
                    function (data, e) {
                    if(null !=data){
                        // console.log(data.data["praise"] )
                        $("#praisCount").html("(" + show_num(data.data["praise"]) + ")");
                    }
                });
            },
            error: function (a) {
            }
        });
        $("#a_prais").click(function () { //点赞
            if(isPraiseHidden=="false"){
                var key = $.cookie('Praise_System_Id_' + projectId);
                if (key==null || key==undefined || key!="true"){
                    $.getJSON("//sq.jr.jd.com/cm/praise?key=1000&systemId="+projectId+"&callback=?", function(data,e) {
                        if(data!=null && data["praise"]!=null && data["praise"]!= undefined){
                            show_data(data);
                            $.cookie('Praise_System_Id_' + projectId, 'true', {path: "/"});
                            //已赞
                            $("#a_prais").removeClass("not-praise").addClass("praise");
                            $("#prais").html("已赞");
                        } else {
                            alert('网络不给力，稍后重试一下');
                        }
                    });
                } else {
                    alert('已点赞');
                }
            }
        });
        $("#a_focus").click(function () { //关注
        	if(isPraiseHidden=="false"){
	            var code = $(this).html();
	            if (code.indexOf("已关注") != -1) { //已关注了
	                alert("已关注");
	                return;
	            } else {
	                jQuery.ajax({
	                    url: "//"+window.location.host+"/get_loginuser.action?temp="+Math.random(),
	                    /*url: "http://" + window.location.host + "/get_loginuser.action?temp=" + Math.random(),*/
	                    dataType: "text",
	                    scriptCharset: "utf-8",
	                    success: function (msg) {
	                        $("#user_pin").val(msg);
	                        var name = $("#user_pin").val();
	                        if (msg == null || msg == "" || msg == undefined) {
	                            seajs.use('common/unit/login/1.0.0/login', function (login) {
	                                login(function () {
	                                    // 登陆成功回调
	                                    doFocus();
	                                });
	                            });
	                        } else {
	                            doFocus();
	                        }
	                    }, error: function (e) {
	                        $("#user_pin").val("");
	                    }
	                });
	            }
        	}
        });
        if(isTopicHidden=="false"){
        	getTopicCount();
        }
    }
    //关注项目
    function doFocus() {
        var url = "//sq.jr.jd.com/cm_focus/collection?key=1000&systemId="+projectId+"&likeType=3&status=0&callback=?&temp="+Math.random();
        jQuery.ajax({
            url: url, dataType: "jsonp", scriptCharset: "utf-8", success: function (data) {
                if(data != null){
                    jQuery.ajax({
                        url: "//"+window.location.host+"/get_loginuser.action?temp="+Math.random(),
                        /*url: "http://" + window.location.host + "/get_loginuser.action?temp=" + Math.random(),*/
                        dataType: "text",
                        scriptCharset: "utf-8",
                        success: function (msg) {
                            //获取关注项目数
                            var loadCountUrl = "//sq.jr.jd.com/collectionList?key=1000&pin="+msg+"&systemId="+projectId+"&likeType=3&status=10&callback=?";
                            jQuery.ajax({
                                url: loadCountUrl, dataType: "jsonp", scriptCharset: "utf-8", success: function (a) {
                                    console.log("关注项目数2",a.data)
                                    if(a != null && a.data != null){
                                        $("#focusCount").html("(" + show_num(a.data["focus"]) + ")");
                                        $("#a_focus").html($("#a_focus").removeClass("not-follow").addClass("follow").html().replace("关注","已关注"));
                                    }
                                }
                            });
                        },error: function (e) {
                            $("#user_pin").val("");
                        }
                    });
                }else{
                    $("#focusCount").html("(0)");
                }
                getLoginUser(null);
            },
            error: function (a) {
                alert("哎呦喂，网络飞到外太空了，稍后试试吧~");
            }
        });
    }

    function show_data(data) {
        $("#praisCount").html("(" + show_num(data["praise"]) + ")");
        // $("#focusCount").html("(" + show_num(data["focus"]) + ")");
    }

    function show_num(f) {
        if (f >= 10000) {
            return parseInt(f / 10000) + "万";
        } else if (f < 10000 && f >= 1000) {
            return parseInt(f / 1000) + "千";
        } else {
            if(f < 0){
                return 0;
            }else{
                return f;
            }
        }
    }

    function getTopicCount() {
        var url = "//sq.jr.jd.com/topic/count?key=1000&systemId=" + $("#projectId").val() + "&callback=?";
        jQuery.ajax({
            url: url, type: "get", dataType: "jsonp", scriptCharset: "utf-8", success: function (data) {
                if (data["count"] != undefined && data["count"] != null) {
                    $("#topicBtn").find("span").html(data["count"]);
                }
            },
            error: function (a) {
                $("#topicBtn").children("span").html("0");
            }
        });
    }

    //是否关注
    function isFocus(projectId,msg) {
        $.getJSON("//sq.jr.jd.com/collectionList?key=1000&pin="+msg+"&systemId="+projectId+"&likeType=3&status=10&callback=?",
            function(data, e) {
            console.log("关注项目数3",data.data)
            if(null != data){
                $("#focusCount").html("(" + show_num(data.data["focus"]) + ")");
            }else{
                $("#focusCount").html("(0)");
            }
            if(data.flag == false){
                $("#a_focus").html($("#a_focus").removeClass("follow").addClass("not-follow").html().replace("已关注","关注"));
            }else{
                $("#a_focus").html($("#a_focus").removeClass("not-follow").addClass("follow").html().replace("关注","已关注"));
            }

        });
    }

    function showUser() {
        var name = $("#user_pin").val();
        if (name == null || name == "" || name == undefined) { //未登录的情况
            $("#unlogin").css("display", "block");
            $("#login").css("display", "none");
        } else {
            $("#unlogin").css("display", "none");
            $("#login").css("display", "block");
            //$("#login").html($("#loginbar").text()+$("#login").html());
        }
    }

    function isLoginUser() {
        var keys = JrTools.getCookie("pin");
       if(keys != null){
           return true;
       }
        return false;
    }



    module.exports = praisAndFocus;
});
