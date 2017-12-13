const path = require('path');
const fs = require('fs');
const https = require('https');
const cheerio = require('cheerio');

const config = require('./config/config');

const netpath = config.netpath;
const localpath = config.localpath;

const requestnet = (netpath) => {
	https.get(netpath,(res) => {
		const {statusCode} = res;
		let html = '';
		if(statusCode !== 200){
			console.error('请求失败。\n' + `状态码: ${statusCode}`);
		}
		res.setEncoding('utf8');
		
		res.on('data',(chunk) => {
			html += chunk;
		});
		res.on('end',() => {
			const $ = cheerio.load(html);
			const h2title = $('.function-drop h2:first-child').text().trim();
			const functionsspan = $('.function-drop span:nth-child(2)').html().trim();
			const cloudsspan = $('.accounts span:first-child').text().trim();
			const cloudone = $('.mcclear .clouds span').text().trim();
			const downstwo = $('.mcclear .downs span').text().trim();
			const transferthree = $('.mcclear .transfer span').text().trim();

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
	$('.media2 .container h2:first-child').text(netdata.h2title);
	$('.media2 .container p.text-center').html(netdata.functionsspan);
	$('.carousel .container p.title').text(netdata.cloudsspan);
	$('.media2 ul.media-items-x3 li:first-child p.item-txt').text(netdata.cloudone);
	$('.media2 ul.media-items-x3 li:nth-child(2) p.item-txt').text(netdata.downstwo);
	$('.media2 ul.media-items-x3 li:nth-child(3) p.item-txt').text(netdata.transferthree);
	const modifiedhtml = $.html();
	fs.createWriteStream(localpath,{flags: 'r+',encoding: 'utf8'}).end(modifiedhtml,() => {
		console.info(`${localpath} modified success!`);
	});
	
};
requestnet(netpath);