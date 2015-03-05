# Capstone_Project



Mongo DB: shoes

Collections In Use:

all_flats	2037
boots	2370
evening_wedding	1147
exotics	313
mules_slides_clogs	304
pumps_slingbacks	2467
sandals	5001
sneakers	1123
wedges	1300
athletic	186
espadrilles	298
*booties	963

Retired Collections:
	db.evening.find({"company":"saks"}).forEach(function(doc){ db.evening_wedding.insert(doc); });
	db.evening.find({"company":"barneys"}).forEach(function(doc){ db.evening_wedding.insert(doc); });
	db.evening.find({"company":"saks"}).forEach(function(doc){ db.wedding.insert(doc); });
flats
oxfords_loafers_moccasins
wedding
evening
mules_slides

902 duplcates in booties

sorts the product_id entries and loops through them in order. If an product_id is repeated, then they will be "back-to-back" after sorting. So we just keep a pointer to previous_product_id and compare it current.product_id. If we find a duplicate, I'm dropping it into the duplicates collection (and using $inc to count the number of duplicates)

'''
var previous_product_id;
db.test.find( {"product_id" : {$exists:true} }, {"product_id" : 1} ).sort( { "product_id" : 1} ).forEach( function(current) {

  if(current.product_id == previous_product_id){
    db.duplicates.update( {"_id" : current.product_id}, { "$inc" : {count:1} }, true);
  }

  previous_product_id = current.product_id;

});
'''


db.test.aggregate( [
   {
     $group: {
        _id: "$product_id",
        count: { $sum: 1 }
     }
   },
   { $match: { count: { $gt: 1 } } }
] )