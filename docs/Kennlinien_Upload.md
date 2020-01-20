# Kennlinien Upload
Zu dem Upload von Kennlinien hab ich ein Squenzdiagramm in unser docs Repo gepushed, hier eine Erklärung in Worten

## Setup
Kennliniendaten werden über den schon vorhandenen Dateiupload an ObservedObjects angehangen und automatisch geparsed. Module in unserem Projekt sind allerdings nur Datensätze eines bestimmten ObservedObjects, also müssen wir um individuelle Kennlinien zu speichern, für jedes Modul ein ObservedObject erstellen. Dazu muss man erstmal einen Type für diese ObservedObjects anlegen:

```
observedobjecttype/create -> mit dem folgenden JSON als nachricht:
{
	"name": "Dummy ObservedObjectType",
	"description": "Dummy Typ um Kennlinienspeicherung fuer ModulTypen zu erlauben"
}
```


(Ich muss mal schauen, vielleicht mach ich dafür morgen ein kleines Setup script, könnten wir auch beim deployen gebrauchen)


## Andere Schnittstellen:

### Verbindung "Modul <-> Kennlinien ObservedObject" erstellen
Um eine Verbindung zwischen einem Modul (also Datensatz in einem ObservedObject) und einem anderen ObservedObject herzustellen, bietet sich die Schnittstelle "ObservedObjectJoinDataSet" an.

```
observedobjectjoindataset/create
{
	//Referenz auf das Kennlinien ObservedObject
	"describedObservedObject": "ref://observedobject/get/8",
	//Referenz auf das ObservedObject mit den ModulTypen
	"describingObservedObject": "ref://observedobject/get/1",
	//Modul ID
	"dataset": 3
}
```

### Verbindungen auflisten

```
observedobjectjoindataset/listForDescribingObservedObjectAndDataSet?ooid=1&dataset=<modulId>
```

In unserem Fall sollte es immer nur eine oder gar keine Verbindung geben.



### ObservedObject erstellen

```
 observedobject/create
 {
 	//Key des derzeitigen Moduls
	"name": "dummy_"+key,
	//<dummy_type_id> ist die ID des ObservedObjectType der im Setup angelegt wird
	"type": "ref://observedobjecttype/get/<dummy_type_id>"
}
```



## Ablauf

Sobald der User auf "Kennlinie Hochladen" klickt wird eine Liste aller Verbindungen abgerufen. Wenn die Liste einen Eintrag hat, nehme die ID des des Eintrags von dem Feld "describedObservedObject". Wenn keine Einträge in der Liste existieren soll Folgendes geschehen: Ein neues ObservedObject wird erstellt, danach eine Verbindung von dem derzeitigen Modul zu dem neuen ObservedObject angelegt. Wenn alles OK ist, nehme von dem neu angelegten ObservedObject die ID.  

Jetzt hat man auf einem von zwei Wegen eine ObservedObject ID bekommen, dann muss jetzt die Modulauswahl angezeigt werden. Diese soll eine Select-Box mit Button "Zum Upload" oder sowas sein.

In die Select-Box schreiben wir nur einen Eintrag:

```
Angezeigt wird im Eintrag: "Für Alle"
Value: <Die ObservedObject ID>
```

Dann muss nach dem Klick auf den "Zum Upload" Button nur noch der derzeitige value der Select-Box geholt und in die Weiterleitung reingepackt werden.

Wenn Florian/Cem/Behrens es dann wollen, können Sie zu dieser Select-Box noch andere ObservedObjects hinzufügen, dass ist aber nicht unsere Aufgabe.