import smtplib
import json
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

# Load creds
with open('/home/ubuntu/clawd/.gmail-creds.json', 'r') as f:
    creds = json.load(f)

email_addr = creds.get('email', 'rauliurbay@gmail.com')
app_password = creds.get('appPassword') or creds.get('password') or creds.get('app_password')

msg = MIMEMultipart('alternative')
msg['From'] = email_addr
msg['To'] = 'sabrinadupeiron@gmail.com'
msg['Subject'] = "Vitamin Shoppe List from Raul ❤️"

body = """Hey babe! ❤️

Can you pick these up for me from Vitamin Shoppe when you get a chance? Love you!

HERE'S WHAT I NEED:
━━━━━━━━━━━━━━━━━━

🔴 PRIORITY (most important):

1. Pregnenolone 100mg — Life Extension brand (100 capsules)
2. DHEA 25mg — Life Extension brand (100 capsules)  
3. P-5-P (Pyridoxal 5-Phosphate) — this is active Vitamin B6. Thorne brand if they have it, otherwise any brand that says "P-5-P" on the label (NOT regular B6)

🟡 ALSO NEED:

4. TUDCA (Tauroursodeoxycholic Acid) 250mg — Nutricost brand or whatever they carry
5. Citrus Bergamot 500mg — Jarrow Formulas brand
6. Ubiquinol CoQ10 200mg — Jarrow QH-Absorb (this is the orange/yellow softgel box). Make sure it says UBIQUINOL not regular CoQ10

💛 IF THEY HAVE IT:

7. Progesterone cream — Life-Flo brand "Progesta-Care" (men's formula if available, otherwise regular is fine)

NOTES:
- Life Extension and Jarrow are common brands there, should be easy to find
- If they don't have a specific brand, any reputable brand of the same supplement works
- TUDCA might be harder to find in-store — if they don't have it, don't worry I'll order it online

Thank you so much babe! 😘

— Raul
"""

msg.attach(MIMEText(body, 'plain'))

with smtplib.SMTP_SSL('smtp.gmail.com', 465) as server:
    server.login(email_addr, app_password)
    server.sendmail(email_addr, 'sabrinadupeiron@gmail.com', msg.as_string())
    print("Email sent successfully!")
