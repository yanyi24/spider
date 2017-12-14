const fs = require('fs');
const path = require('path');
const https = require('https');
const cheerio = require('cheerio');

const config = require('./config/config');

const netdir = config.netdir;
const localdir = config.localdir;

const netposition = config.netposition;
const localpostion = config.localposition;

let filesnum = 1;
const requestnet = (netpath,localpath) => {
	https.get(netpath,(res) => {
		const {statusCode} = res;
		let html = '';
		if(statusCode !== 200){
			console.error(`${netpath}` + '请求失败。\n' + `状态码: ${statusCode}`);
		}
		res.setEncoding('utf8');
		
		res.on('data',(chunk) => {
			html += chunk;
		});
		res.on('end',() => {
			const $ = cheerio.load(html);
			const h2title = $('.function-drop h2:first-child').html();
			const functionsspan = $('.function-drop span:nth-child(2)').html();
			const cloudsspan = $('.accounts span:first-child').html();
			const cloudone = $('.mcclear .clouds span').html();
			const downstwo = $('.mcclear .downs span').html();
			const transferthree = $('.mcclear .transfer span').html();

			const output = {
				h2title,
				functionsspan,
				cloudsspan,
				cloudone,
				downstwo,
				transferthree
			};
			//console.info(output);
			modifylocalfile(localpath,output);
		});
	}).on('error', (e) => {
		console.error(`错误: ${e.message}`);
	});
};
const modifylocalfile = (localpath,netdata) => {
	let filehtml = fs.readFileSync(localpath).toString();
	const $ = cheerio.load(filehtml);
	$('.media2 .container h2:first-child').html(netdata.h2title);
	$('.media2 .container p.text-center').html(netdata.functionsspan);
	$('.carousel .container p.title').html(netdata.cloudsspan);
	$('.media2 ul.media-items-x3 li:first-child p.item-txt').html(netdata.cloudone);
	$('.media2 ul.media-items-x3 li:nth-child(2) p.item-txt').html(netdata.downstwo);
	$('.media2 ul.media-items-x3 li:nth-child(3) p.item-txt').html(netdata.transferthree);
	const modifiedhtml = $.html();
	fs.createWriteStream(localpath,{flags: 'r+',encoding: 'utf8'}).end(modifiedhtml,() => {
		console.info(`${localpath} modified success! ----第${filesnum}个文件`);
		filesnum ++ ;
	});
	
};
// requestnet(netpath);
/**
 * 
 * @param {*} netdir  string
 * @param {*} localdir   string
 * 
 * 需要修改的文件的上一级文件夹名称
 */
const solvefolder = (netdir,localdir) => {
	fs.readdir(localdir,(err,files) => {
		const fileslen = files.length;
		for(let i = 0; i < fileslen; i++){
			const file = files[i];
			const localpath = path.join(localdir,file);
			const netpath = `${netdir}${file}`;
			requestnet(netpath,localpath);
		}
	});
};


/**
 * 
 * @param {*} netposition   string
 * @param {*} localpostion   string
 * 
 * 通过配置的路径判断传入的是HTML文件还是文件夹，然后处理
 */
const judgepath = (netposition,localpostion) => {
	if(path.extname(localpostion).toLowerCase() === '.html'){
		requestnet(netposition,localpostion);
	}else{
		solvefolder(netposition,localpostion);
	}
};

judgepath(netposition,localpostion);