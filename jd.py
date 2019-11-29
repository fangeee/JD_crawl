import re
import requests
import time
import json
from config import *

class JD:

    pages = 1

    total_number = 1



    def __init__(self, pagenumber):
        self.pagenumber = pagenumber

    def jd_crawl(self):
        def write_item_to_file(item):
            print('开始写入数据 ====> ' + str(item))
            with open('/Users/fange/Desktop/jd/jd-14.txt', 'a', encoding='UTF-8') as f:
                f.write(json.dumps(item, ensure_ascii=False) + '\n')
                f.close()
        if self.pages <= self.pagenumber:
            data = {
                'status': 8,        #已经完成
                'sort': 'zhtj',
                'categoryId': 14,   #科技-10--done   #美食-36-done  #家电-37  设计-12--done 娱乐-11 文化-38 公益-13 其他-14
                'parentCategoryId': '',
                'sceneEnd': '',
                'productEnd': -28,
                'keyword': '',
                'page': self.pages
            }
            html = requests.post(url, headers=header, data=data)
            if html.status_code == 200:
                regu = re.compile('class="i-tits.*?href="(.*?)"', re.S)
                #re是正则表达式包 第一个参数是规则 第二个参数是内容
                results = re.findall(regu, html.text)
                #regu是一个模式，匹配所有html.txt里面的内容
                self.pages += 1

                for result in results:
                    web = result
                    web2 = 'https://z.jd.com/'+str(web)
                    detailhtml = requests.get(web2)
                    if html.status_code == 200:
                        detailregu = re.compile('<h1 class="p-title">(.*?)</h1>.*?<p class="p-num"><span>￥</span>(.*?)</p>.*?<span class="fl percent">(.*?)</span><span.*?class="fr">(.*?)</span>.*?<span class="f_red">(.*?)</span>前得到.*?<span class="f_red"><i>￥</i>(.*?)</span>.*?项目进展<span class="tab-bubble">(.*?)</span></h2>.*?<div class="fl start"><span>发起</span><span class="num">(.*?)</span></div>.*?<div class="fl"><span>支持</span><span class="num">(.*?)</span></div>', re.S)
                        detailresults = re.findall(detailregu, detailhtml.text)


                        if len(detailresults) == 1 and len(detailresults[0]) == 9:




                            pname, realmoney, process, support, enddate, aimmoney, reportcount, prepost, presupport = detailresults[0]
                            pname=pname.replace('，', '')
                            enddate = enddate.strip()

                        #结束日期
                            totalpic = (detailhtml.text).count('<img class="lazyout-detail" ')+(detailhtml.text).count('<img alt=')
                        #图片数量
                            totalvideo = (detailhtml.text).count('360buyimg.com/video')
                        #视频数量
                            totalpriceregu = re.compile('￥<span>(.*?)</span>.*?<span class="limit-num">限额 <span>(.*?)</span>份.*?剩余 <span>(.*?)</span>份</span>.*?<p class="box-item">配送费用：.*?<span class="font-b">(.*?)</span>.*?class="font-red">(.*?)</span>天内</span></p>', re.S)
                            totalprice = re.findall(totalpriceregu, detailhtml.text)
                        #所有档位
                            countprice = len({}.fromkeys(totalprice).keys())
                        #不同档位的个数
                            startdateregu = re.compile('<span class="pro-day-t">(.*?)</span>', re.S)
                            startdate = re.findall(startdateregu, detailhtml.text)
                            if len(startdate) == 0:
                                startdate = 0
                            else:
                                startdate = startdate[-1].strip()

                            alldetail = [pname, process, realmoney, aimmoney, startdate, enddate, totalpic, totalvideo, reportcount, prepost, presupport, support, countprice, totalprice]
                            write_item_to_file(alldetail)
                        else:
                            self.total_number += 1
                    else:
                        print("没有内容")
                    self.total_number += 1
                time.sleep(1)
                self.jd_crawl()

            else:
                print('状态码不为200')
        else:
            print('爬取完毕')


if __name__ == '__main__':
    user_want = input('输入要爬取页数')
    if user_want.isdigit() and int(user_want) in range(0, 101):
        spider = JD(int(user_want))
        spider.jd_crawl()
    else:
        print('输入数字和大于0且小于100的数')

