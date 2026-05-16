# Hvepseeksperterne

Hjemmeside for Hvepseeksperterne v/ Jürgen Hanika — skånsom flytning af
hvepse, gedehamse og bier i Danmark.

## Struktur

- `index.html` — forside med hero, ydelser, forløb, FAQ, kontakt
- `handelsbetingelser.html` — virksomhedsoplysninger, GDPR, fortrydelsesret
- `img/` — billeder (oprettes når billederne genereres)

## Virksomhed

- **Hvepseeksperterne** · Skolegade 27, 6240 Løgumkloster
- CVR: 45785386
- Tlf: +45 60 46 30 53
- Momsfritaget jf. ML §48

## Lokal udvikling

Åbn `index.html` direkte i en browser, eller kør en lokal webserver:

```powershell
# Python
python -m http.server 8000

# Node
npx serve .
```

## Deployment

Statisk side — kan hostes hvor som helst (Netlify, Cloudflare Pages,
GitHub Pages, simpelweb-hosting).

Kontaktformularen er pt. en demo (alert). Skal kobles op mod et
backend (SMTP via udag.de) før produktion.

## TODO

- [ ] Billeder genereres og lægges i `img/`
- [ ] Kontaktformular kobles til backend
- [ ] Favicon + Open Graph billede
- [ ] Domæne registreres
- [ ] Dybere undersider pr. insektart (hvepse, gedehamse, bier, humlebier)
