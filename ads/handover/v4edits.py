import sys
R = [
("<p><b>Early Bird deadline:</b> Friday 2 October, 11:59PM (the most important date in this plan)</p>",
 "<p><b>Early Bird deadline:</b> Monday 5 October, 11:59PM (the most important date in this plan)</p>"),
("Version 3, 30 September 2026", "Version 4, 30 September 2026"),
("<td>A new dataset you create in your business, <b>The Cookout KL</b>. We install it on our site (section 3). Don't install any other pixel.</td>",
 "<td><b>The Cookout KL</b> (<code>28544942708504204</code>), in your business. Already live on every page of our site (section 3). Don't install any other pixel.</td>"),
("<td>About RM 1,900 over 10 days, on the dated schedule in section 4. No other budget changes without asking.</td>",
 "<td><b>RM 1,400 in total</b> (RM 700 from Bunker 1965, RM 700 from The Cookout), on the dated schedule in section 4. No other budget changes without asking.</td>"),
("<li>Create the dataset and send Donny its ID now</li>", "<li>Pick the dataset The Cookout KL in both campaigns</li>"),
("<li>Install your dataset on our site within the hour</li>", "<li>Keep your dataset running on our site (live since 30 Sep)</li>"),
("<td>Early Bird RM 65 until Fri 2 Oct, 11:59PM. Then RM 85 online, on sale right up until doors. RM 100 at the door.</td>",
 "<td>Early Bird RM 65 until Mon 5 Oct, 11:59PM. Then RM 85 online, on sale right up until doors. RM 100 at the door.</td>"),
("""  <li><span class="stepnum">1</span>In the Bunker 1965 business, open <b>Events Manager</b>, click <b>Connect Data Sources</b>, pick <b>Web</b>, name it <b>The Cookout KL</b> and click Create. If it asks how to install the code, close that window.</li>
  <li><span class="stepnum">2</span>Send Donny the <b>Dataset ID</b> (the long number under the name). We add it to every page on thecookoutevent.com, usually within the hour.</li>
  <li><span class="stepnum">3</span><b>Recommended:</b> in the dataset open Settings, Conversions API, <b>Generate Access Token</b>, and send it to Donny privately (never in a group). It adds our server's copy of each event, so sign-ups from iPhones and ad blockers still count.</li>""",
"""  <li><span class="stepnum">1</span><b>Done 30 Sep:</b> you created <b>The Cookout KL</b> (<code>28544942708504204</code>) and it's live on every page of thecookoutevent.com.</li>
  <li><span class="stepnum">2</span><b>Done 30 Sep:</b> you sent the Conversions API token. Our server's copy of each event starts as soon as Donny adds it on our side, so sign-ups from iPhones and ad blockers still count.</li>
  <li><span class="stepnum">3</span>Don't generate a new token for this dataset: it would stop the server copy until we swap it in.</li>"""),
("<h3>Budget Schedule (Daily Budgets, About RM 1,900 In Total)</h3>", "<h3>Budget Schedule (Daily Budgets, RM 1,400 In Total)</h3>"),
("""  <tr><td><b>Thu 1 to Fri 2 Oct</b></td><td>RM 200 a day</td><td>Fri only: RM 40</td><td>Early Bird ends Fri 11:59PM. The strongest 2 days.</td></tr>
  <tr><td><b>Sat 3 to Tue 6 Oct</b></td><td>RM 150 a day</td><td>RM 40 a day</td><td>Keep the list growing at RM 85.</td></tr>
  <tr><td><b>Wed 7 to Sat 10 Oct</b></td><td>RM 120 a day</td><td>RM 60 a day</td><td>Final push to people who already know about it. Both end Sat 4PM.</td></tr>
  <tr><td><b>Totals</b></td><td>RM 1,480</td><td>RM 440</td><td>About RM 1,920, a little less as Saturday stops at 4PM.</td></tr>""",
"""  <tr><td><b>Thu 1 to Mon 5 Oct</b></td><td>RM 130 a day</td><td>Fri 2 to Mon 5: RM 25 a day</td><td>Early Bird window. Ends Mon 11:59PM.</td></tr>
  <tr><td><b>Tue 6 to Fri 9 Oct</b></td><td>RM 90 a day</td><td>RM 30 a day</td><td>Keep the list growing at RM 85.</td></tr>
  <tr><td><b>Sat 10 Oct, until 4PM</b></td><td>RM 100</td><td>RM 50</td><td>Doors at 4PM. Both campaigns stop then.</td></tr>
  <tr><td><b>Totals</b></td><td>RM 1,110</td><td>RM 270</td><td>RM 1,380 at most. A little less in practice, as Saturday stops at 4PM.</td></tr>"""),
("Early Bird ends Fri 2 Oct at 11:59PM. Get on the list free and we'll take you straight to it.",
 "Early Bird ends Mon 5 Oct at 11:59PM. Get on the list free and we'll take you straight to it."),
("<tr><td>Early Bird Ends Fri 2 Oct</td><td>Free to join the list.</td></tr>", "<tr><td>Early Bird Ends Mon 5 Oct</td><td>Free to join the list.</td></tr>"),
("<p><b>From Saturday 3 October</b>, swap", "<p><b>From Tuesday 6 October</b>, swap"),
("Primary Text 5b: From 3 Oct", "Primary Text 5b: From 6 Oct"),
("""<div class="copy"><div class="h">A: Fri 2 Oct Only (Early Bird Ends)</div>Early Bird ends tonight at 11:59PM.

RM 65 gets you into The Cookout: BBQ, burgers, hot dogs, crispy tenders and jollof, pickleball, spades and dominoes, then 90s R&amp;B, Afrobeats and Amapiano till midnight. Your first drink's on us.

From tomorrow it's RM 85. At the door it's RM 100.

Sat 10 Oct, 4PM at Bunker 1965, Red Warehouse, KL.</div>""",
"""<div class="copy"><div class="h">A1: Fri 2 To Sun 4 Oct</div>RM 65 tickets end Monday night.

The Cookout: BBQ, burgers, hot dogs, crispy tenders and jollof, pickleball, spades and dominoes, then 90s R&amp;B, Afrobeats and Amapiano till midnight. Your first drink's on us.

Early Bird is RM 65 until Mon 5 Oct, 11:59PM. After that it's RM 85, and RM 100 at the door.

Sat 10 Oct, 4PM at Bunker 1965, Red Warehouse, KL.</div>
 <div class="copy"><div class="h">A2: Mon 5 Oct Only (Early Bird Ends)</div>Early Bird ends tonight at 11:59PM.

RM 65 gets you into The Cookout: BBQ, games, then 90s R&amp;B, Afrobeats and Amapiano till midnight. Your first drink's on us.

From tomorrow it's RM 85. At the door it's RM 100.

Sat 10 Oct, 4PM at Bunker 1965, Red Warehouse, KL.</div>"""),
("B1: Sat 3 To Fri 9 Oct", "B1: Tue 6 To Fri 9 Oct"),
("B2: Sat 3 To Fri 9 Oct", "B2: Tue 6 To Fri 9 Oct"),
("<tr><td>A</td><td>RM 65 Ends Tonight</td><td>Then RM 85 online.</td></tr>",
 "<tr><td>A1</td><td>Early Bird Ends Monday</td><td>RM 65 till Mon 11:59PM.</td></tr>\n  <tr><td>A2</td><td>RM 65 Ends Tonight</td><td>Then RM 85 online.</td></tr>"),
("""  <tr><td>1</td><td>Create the dataset The Cookout KL, send Donny the ID (and the access token, privately)</td><td>Bunker team</td><td>Now</td></tr>
  <tr><td>2</td><td>Install the dataset on the site, confirm events are arriving, send 1 test sign-up</td><td>Donny</td><td>Within 1 hour of 1</td></tr>""",
"""  <tr><td>1</td><td>Dataset created, ID and token sent. Live on the site</td><td>Both</td><td>Done 30 Sep</td></tr>
  <tr><td>2</td><td>Send 1 real test sign-up so Lead shows as active</td><td>Donny</td><td>Wed 30 Sep</td></tr>"""),
("<td>Build campaign 2 with copy A, scheduled to start Fri 2 Oct, 8AM</td>", "<td>Build campaign 2 with copy A1, scheduled to start Fri 2 Oct, 8AM</td>"),
("""  <tr><td>8</td><td>Budgets to the Sat 3 Oct row. Campaign 2 to copy B1 and B2. Campaign 1 text 5 and headline 5 to the 5b versions</td><td>Bunker team</td><td>Sat 3 Oct, morning</td></tr>
  <tr><td>9</td><td>Budgets to the Wed 7 Oct row</td><td>Bunker team</td><td>Wed 7 Oct, morning</td></tr>
  <tr><td>10</td><td>Campaign 2 to copy C. Both campaigns stop at 4PM</td><td>Bunker team</td><td>Sat 10 Oct, morning</td></tr>""",
"""  <tr><td>8</td><td>Campaign 2 to copy A2</td><td>Bunker team</td><td>Mon 5 Oct, morning</td></tr>
  <tr><td>9</td><td>Budgets to the Tue 6 Oct row. Campaign 2 to copy B1 and B2. Campaign 1 text 5 and headline 5 to the 5b versions</td><td>Bunker team</td><td>Tue 6 Oct, morning</td></tr>
  <tr><td>10</td><td>Budgets to the Sat 10 Oct row. Campaign 2 to copy C. Both campaigns stop at 4PM</td><td>Bunker team</td><td>Sat 10 Oct, morning</td></tr>"""),
]
for path in sys.argv[1:]:
    pass
texts = {p: open(p).read() for p in sys.argv[1:]}
for a, b in R:
    hits = [p for p in texts if a in texts[p]]
    assert len(hits) == 1 and texts[hits[0]].count(a) == 1, ('NOT UNIQUE/MISSING', a[:70], hits)
    texts[hits[0]] = texts[hits[0]].replace(a, b)
for p, t in texts.items():
    open(p, 'w').write(t)
print('applied', len(R))
