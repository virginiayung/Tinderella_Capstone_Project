from bs4 import BeautifulSoup
import requests
import re


base_url = 'http://www.saksfifthavenue.com/Shoes/Oxfords-Loafers-and-Moccasins/shop/_/N-52k0si/Ne-6lvnb5?FOLDER%3C%3Efolder_id=2534374306624258&Nao='
page_url = [base_url + str(i*60) for i in range(0,2)]



counter = 0
product_dict_name = {}
product_dict_url  = {}

for u in xrange(len(page_url)):
# # Category = 'LOMs'
    response = requests.get(page_url[u])
    soup = BeautifulSoup(response.content, 'html.parser')
    img_lst = soup.select('div.image-container-large .pa-product-large')
    product_lst = soup.select('div.image-container-large a[href]')

    for image_item in img_lst:
        try:
            image_link = image_item['src']
            title = image_item['title']

            if image_link.startswith('http'):
                product_id = re.search(r"(?P<product_id>\d+)\_(\d+)",image_link).group("product_id")
                product_dict_name [product_id] = re.split(" - ", title)

                image = requests.get(image_link).content

                counter += 1

                print counter, ',', product_id
                f = open('/Users/heymanhn/Virginia/Zipfian/Capstone_Project/saks/images/LOMs_%s.png' % str(product_id)
                         , 'w')
                b = open('/Users/heymanhn/Virginia/Zipfian/Capstone_Project/saks/text/ProductNames_LOMs.txt','w')
        
                f.write(image)
                b.write(str(product_dict_name))
        except:
            pass

    for product_item in product_lst:
        try: 
            
            product_id2 = re.search(r"(\w+)\-(?P<product_id>\d+)",product_item['id']).group("product_id")
            product_link = product_item['href']

            if product_link.startswith('http'):
                product_dict_url [product_id2] = product_link

                w = open('/Users/heymanhn/Virginia/Zipfian/Capstone_Project/saks/text/ProductURL_LOMs.txt', 'w')
                w.write(str(product_dict_url))
        except:
            pass





