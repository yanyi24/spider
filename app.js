const fs = require('fs');
const path = require('path');
const https = require('https');
const cheerio = require('cheerio');

const config = require('./config/config');

const netposition = config.netposition;
const localpostion = config.localposition;

const netdatas = config.netselectors;
const localdatas = config.localselectors;

let filesnum = 1;

/**
 * 
 * @param {*} netpath 
 * @param {*} localpath 
 * 
 * 获取网络上的数据
 */
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
			let output = [];

			for(let i = 0; i < netdatas.length; i++){
				output.push($( netdatas[i] ).html());
			}

			modifylocalfile(localpath,output);
		});
	}).on('error', (e) => {
		console.error(`错误: ${e.message}`);
	});
};

/**
 * 
 * @param {*} localpath 
 * @param {*} netdatas array
 * 
 * 根据获取到的数据修改本地数据
 */
const modifylocalfile = (localpath,netdatas) => {
	let filehtml = fs.readFileSync(localpath).toString();
	const $ = cheerio.load(filehtml);

	for(let i = 0; i < localdatas.length; i++){
		$(localdatas[i]).html(netdatas[i]);
	}

	const modifiedhtml = $.html();
	fs.createWriteStream(localpath,{flags: 'r+',encoding: 'utf8'}).end(modifiedhtml,() => {
		console.info(`${localpath} modified success! ----第${filesnum}个文件`);
		filesnum ++ ;
	});
	
};
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
			if(path.extname(file).toLowerCase() === '.html'){
				const localpath = path.join(localdir,file);
				const netpath = `${netdir}${file}`;
				requestnet(netpath,localpath);
			}
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