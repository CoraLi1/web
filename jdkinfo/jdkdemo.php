<?php
	require_once("config.php"); //引入文件  文件只引用一次
	include('jssdk.php');//加入了一个文件
	ini_set('date.timezone','Asia/Shanghai');//设置时区
	//print_r($_GET);
	//print_r($_POST);
	$appUrl = $_GET['appUrl'];//接收前台ajax的参数
    $jssdk = new JSSDK(APP_ID, APP_SECRET,$appUrl);//new了一个类
    $signPackage = $jssdk->GetSignPackage(); //调用这个类的方法
    echo json_encode($signPackage);//数组的值转成json对象
	exit;//结束
    //$this->signPackage = $signPackage;
	//print_r($signPackage);
	  
	  ?>