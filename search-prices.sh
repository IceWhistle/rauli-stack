#!/bin/bash
# Script to search Amazon prices with rate limiting

ASINS=(
  "B0DPY59RDZ:IM8 Daily Ultimate"
  "B09319WFSB:D3 5000 IU Now Foods"
  "B0D2JL4LGJ:K2 MK-7"
  "B00EOXU0MM:Glycine 1kg BulkSupplements"
  "B00F7OZJQE:Mag Glycinate powder BulkSupplements"
  "B00E7GESV0:L-Theanine 100g BulkSupplements"
  "B09LFFGQXM:Apigenin 100mg"
  "B01JZNBP92:Inositol powder"
  "B004TSEDKM:Magnolia Bark"
  "B079YF1K1B:Phosphatidylserine"
  "B000X9QZZ2:Melatonin 0.3mg"
  "B00E9M4XEE:Creatine 1kg BulkSupplements"
  "B00ENSLW7A:Taurine 1kg BulkSupplements"
  "B00XQ2XGAA:Collagen Peptides"
  "B000MGOWN8:TMG"
  "B00GW1TVT2:Quercetin 250g"
  "B089XNB2GS:Lion's Mane 100g"
  "B00E7H96CK:ALCAR 100g"
  "B00F8HGA0E:NAC 250g"
  "B08J2N7KK9:NMN 50g"
  "B002CQU564:Omega-3 Nordic Naturals"
  "B0013OSM34:CoQ10 400mg"
  "B00NGY73DY:Liposomal Glutathione"
  "B0CVXFTMTQ:NAD+ Complete Renue"
  "B076M84NHY:Pterostilbene"
  "B08LF447HK:PQQ 40mg"
  "B07DP8DHBH:R-ALA 600mg"
  "B079K32QB6:Ashwagandha KSM-66"
  "B0BWKDHMJZ:Cistanche 500mg"
  "B0CBSP48B9:Liposomal Curcumin"
  "B0B7SK97B3:Sulforaphane"
  "B08ZCLK948:P5P B6"
  "B0C6YN6K2X:Ca-AKG"
  "B0BJ347ZRK:Spermidine"
  "B0001SR8J2:Vitamin E Mixed"
  "B000MGOX78:Zinc 50mg"
  "B0BKGYNCZF:Copper 3mg"
  "B09C2KYFVC:Fisetin 200mg"
  "B0923DM169:CDP-Choline+Tyrosine"
  "B07WSGGV7T:Uridine 300mg"
)

echo "ASIN | Product | Price Info"
echo "---|---|---"

for item in "${ASINS[@]}"; do
  IFS=':' read -r asin name <<< "$item"
  echo "Searching: $asin - $name"
  sleep 2
done
