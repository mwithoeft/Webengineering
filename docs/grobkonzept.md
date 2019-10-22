# Webportal für PV-Kennlinien - Grobkonzept

Hier finden Sie das Grobkonzept für unser Projekt in Webengineering: 'Webportal für PV-Kennlinien'.  
Im Laufe der Woche wird dieses Konzept noch angepasst.

## Inhaltsverzeichnis

* Team:
    * Arbeitsteilung im Team
    * Schnittstellen zwischen Teammitgliedern
    * Kommunikationsformen
    * Schnittstellen zu Auftraggebern
    * Vorgehensmodell
* Lastenheft:
    * Anforderungen
    * Fragen / Vorschläge zu bestehenden Anforderungen
* Architekturübersicht, (Software / Hardware)
* Übersicht zu verwendender Software (nicht Dev Tools)
* Zeitplan mit grober Aufgabenverteilung




## Team

### Arbeitsteilung im Team

- Projektleiter: Moritz
- Protokollführer: Moritz
- Dokumentation: Jeder kümmert sich darum, die eigenen Fortschritte zu dokumentieren
- Schnittstellenmanager: Michelle
- Backend: Hannes
- Frontend: Michelle, Christiane, Moritz

Kann (bzw. wird) sich noch ändern, wenn wir mehr Informationen im Laufe des Projekts bekommen.
Natürlich arbeitet auch nicht jeder ausschließlich an einer Stelle, sondern übergreifend dort, wo es benötigt wird.


### Schnittstellen zwischen Teammitgliedern

Wir arbeiten auf verschiedenen Branches des gleichen git Repos. Zum Datenaustausch stellen wir gegenseitig Merge-Requests, oder mergen den Branch der anderen Person manuell.
(Oder was ist mit Schnittstellen gemeint?)


### Kommunikationsformen

Zum Austauschen und Organisieren untereinander vewenden wir eine WhatsApp Gruppe. Lokale Meetings finden in der FH statt, online Meetings via TeamSpeak, gegebenenfalls mit TeamViewer.


### Schnittstellen zu Auftraggebern

Die Schnittstelle zum Auftraggeber wird durch einen regelmäßigen Austausch in der FH gepflegt. Dringliche Angelegenheiten können auch über E-Mail geklärt werden.



### Vorgehensmodell

- Kanban als agiles Vorgehensmodell
- wird in einem seperaten Repository durchgeführt


## Lastenheft

### Anforderungen

- Datenbank
 - Definieren eines Datentemplates für beobachtbare Objekte, welche Modul-Stammdaten halten können
- Suchkomponente
 - Komponente die in Daten beliebiger beobachtbarer Objekte (Tabllen) suche kann
  - Volltextsuche über alle oder eine Auswahl von Messwerten (Spalten)
  - Generierung eines Index aus einer vorgegebenen Spalte
  - Anzeige der verfügbaren Einträge zu einem Index
- Gestaltung anwedungsfallspezifischer Seiten mit Hilfe der allgemeinen Komponenten
 - Anzeigen der eigenen Photovoltaikanlagen/Module
  - Rechtesystem für Datenzugriff
 - Anzeige der Kennlinie eines eigenen Moduls und einer anderen Kennlinie (Durchschnitt)
 - Detailseite modular aufbauen (Kennlinien, Fehleranalyse/Downloads, Diskussionen, etc.)
 - Startseite Suche für die Modulseite -> Suche als Komponent
 - Modulseite hat auch einen Header der die Suche beinhaltet
 - Buchstaben auswählen

### Fragen / Vorschläge zu bestehenden Anforderungen

- -/-
