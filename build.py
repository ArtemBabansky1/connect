from pathlib import Path
from html import escape
import re

root = Path(__file__).parent
lines = (root / 'source.txt').read_text().splitlines()
def t(n): return escape(lines[n-1].strip())
def icon(name): return f'<i data-lucide="{name}" aria-hidden="true"></i>'
def cta(label, cls=''):
    return f'<a class="button {cls}" href="#registration"><span>{label}</span>{icon("arrow-up-right")}</a>'

def marquee():
    # The user explicitly removed the date placeholder from both ribbons.
    event = lines[3].split(' ⧫ ', 1)[1]
    items = event.split(' ⧫ ')
    group = ''.join(f'<span class="marquee-item">{escape(item)}</span><span class="marquee-separator">⧫</span>' for _ in range(4) for item in items)
    return f'''<div class="event-marquee"><span class="sr-only">{escape(event)}</span>
      <div class="marquee-track" aria-hidden="true"><div class="marquee-group">{group}</div><div class="marquee-group">{group}</div></div></div>'''

topics = ''.join(f'<article class="topic"><span class="index" aria-hidden="true">0{i+1}</span><img class="topic-art" src="assets/topic-{asset}.png" width="1024" height="1024" loading="lazy" alt=""><p>{t(n)}</p></article>' for i,(n,asset) in enumerate(zip(range(12,16),['profile','conversation','feedback','community'])))
extras = ''.join(f'<li class="reveal">{icon(ico)}<p>{t(n)}</p></li>' for n,ico in zip(range(17,20),['files','users-round','link']))
audience = ''.join(f'<li class="reveal"><span aria-hidden="true">0{i+1}</span><p>{t(n)}</p>{icon("arrow-up-right")}</li>' for i,n in enumerate(range(24,29)))

speaker_data = [
    ('Екатерина Скворцова', lines[32].split('Екатерина Скворцова ')[1].split(' Тема:')[0], 'Тема:'+lines[32].split('Тема:')[1], 'messages-square', ''),
    ('Илья Васюков', '[интро]', 'Тема:'+lines[33].split('Тема:')[1], 'waypoints', ''),
    ('Евгения Нестерова', lines[34].split('Евгения Нестерова ')[1].strip(), lines[35].strip(), 'compass', ''),
    (lines[36], lines[37], lines[41], 'network', ''.join(f'<p>{t(n)}</p>' for n in [39,40,41,43,44,45])),
]
speakers = ''
for i,(name,bio,topic,ico,more) in enumerate(speaker_data):
    speakers += f'''<article class="speaker reveal speaker-{i+1}">
      <div class="speaker-top"><span class="index" aria-hidden="true">0{i+1}</span><div class="speaker-symbol">{icon(ico)}</div></div>
      <h3>{escape(name.split(' ', 1)[0])}<br>{escape(name.split(' ', 1)[1])}</h3><p class="speaker-topic">{escape(topic)}</p>
      <details class="speaker-details"><summary><span>{escape(name)}</span>{icon('plus')}</summary><div class="details-body"><p>{escape(bio)}</p>{more}</div></details>
    </article>'''
faq = ''
for n,body in [(51,[52,53]),(54,[55,56]),(57,[58])]:
    label = t(n).replace(' [раскрывается по клику]', '')
    faq += f'<details class="faq-item reveal"><summary><span>{label}</span>{icon("plus")}</summary><div class="details-body">'+''.join(f'<p>{t(p)}</p>' for p in body)+'</div></details>'

html = f'''<!doctype html>
<html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="theme-color" content="#f7f5ef"><meta name="description" content="{t(3)}">
<title>{t(2)}</title>
<link rel="icon" type="image/svg+xml" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='18' fill='%23fc5b16'/%3E%3Cg fill='none' stroke='%23fff' stroke-width='7'%3E%3Cellipse cx='24' cy='32' rx='12' ry='18' transform='rotate(35 24 32)'/%3E%3Cellipse cx='40' cy='32' rx='12' ry='18' transform='rotate(35 40 32)'/%3E%3C/g%3E%3C/svg%3E">
<link rel="preload" href="assets/manrope-regular.ttf" as="font" type="font/ttf" crossorigin>
<link rel="stylesheet" href="styles.css">
<link rel="stylesheet" href="refinements.css">
<script src="assets/lucide.min.js" defer></script><script src="app.js" defer></script>
</head><body>
<header class="header wrap"><a class="brand" href="#top" aria-label="СВЯЗИ">{icon('link')}<span>СВЯЗИ</span></a>
<nav aria-label="СВЯЗИ"><a href="#program">{t(9)}</a><a href="#audience">{t(23)}</a><a href="#speakers">{t(31)}</a></nav>{cta('Пойду!', 'button-small')}</header>
<main>
<section class="hero" id="top" aria-labelledby="hero-title"><div class="hero-stage wrap">
  <h1 id="hero-title"><span class="line"><span>КАК СОЗДАВАТЬ</span></span><span class="line"><span>И ПОДДЕРЖИВАТЬ</span></span><span class="line word"><span>СВЯЗИ</span></span></h1>
  <div class="hero-art" aria-hidden="true"><img src="assets/networking-orange-loops.png" width="1254" height="1254" alt="" fetchpriority="high"><div class="hero-orbit"></div></div>
  <div class="hero-copy"><p>{t(3)}</p>{cta('Пойду!')}</div>
  </div>{marquee()}
</section>
<section class="program section wrap" id="program" aria-labelledby="program-title">
  <div class="program-scroll"><div class="program-pin">
    <div class="section-heading"><h2 id="program-title">{t(9)}</h2><ul class="timing-list"><li>Конференция (~1,5 часа)</li><li>практическая сессия (~30 минут)</li></ul></div>
    <div class="topics-viewport"><div class="topics" id="topics">{topics}</div></div>
  </div></div>
  <div class="extras"><h3 class="reveal">{t(16)}</h3><ul>{extras}</ul></div>
  <div class="section-action reveal">{cta('Записаться!')}</div>
</section>
<section class="audience section" id="audience" aria-labelledby="audience-title"><div class="wrap audience-grid">
  <div class="audience-aside"><h2 id="audience-title" class="reveal">{t(23)}</h2><div class="audience-art reveal" aria-hidden="true"><img src="assets/audience-community.png" width="1024" height="1024" loading="lazy" alt=""></div></div>
  <ul class="audience-list">{audience}</ul>
</div></section>
<section class="speakers section wrap" id="speakers" aria-labelledby="speakers-title"><h2 id="speakers-title" class="reveal">{t(31)}</h2><div class="speaker-grid">{speakers}</div><div class="section-action reveal">{cta('Зарегистрироваться!')}</div></section>
<section class="philosophy section wrap" id="about"><div class="philosophy-mark reveal" aria-hidden="true">{icon('asterisk')}</div><div class="faq-list">{faq}</div><button class="button button-outline" type="button" data-external="question" disabled><span>Задать вопрос</span>{icon('arrow-up-right')}</button></section>
<section class="registration" id="registration" aria-labelledby="registration-title"><div class="wrap registration-inner"><h2 id="registration-title" class="reveal">{t(2)}</h2><div class="registration-bottom"><button class="button button-light" type="button" data-external="registration" disabled><span>Зарегистрироваться!</span>{icon('arrow-up-right')}</button></div></div>{marquee()}</section>
</main><footer class="footer wrap"><a class="brand" href="#top">{icon('link')}<span>СВЯЗИ</span></a><p>{t(62)}</p><a class="back-top" href="#top" aria-label="КАК СОЗДАВАТЬ И ПОДДЕРЖИВАТЬ СВЯЗИ">{icon('arrow-up')}</a></footer>
</body></html>'''
# Build-time typography works before first paint and without JavaScript. Only
# spaces change; the original wording and the archival source remain intact.
short_words = 'в во на по к ко у о об обо от до за из со с при без для над под про перед между через и а но не ни же бы я мы вы ты он она оно они мне нам вам нас вас мой мои моя моё твой свой это все что как'.split()
short_pattern = re.compile(r'(?<![\w])(' + '|'.join(sorted(short_words, key=len, reverse=True)) + r') +(?=[\w«„“])', re.IGNORECASE)
def typograph(text):
    text = short_pattern.sub(lambda match: match[1] + '\u00a0', text)
    text = re.sub(r'(\d) (?=(?:МСК|час|минут))', lambda match: match[1] + '\u00a0', text)
    return text
html = re.sub(r'(?<=>)([^<>]+)(?=<)', lambda match: typograph(match[0]), html)
(root/'dist/index.html').write_text(html)
print('Built dist/index.html from unchanged source.txt')
