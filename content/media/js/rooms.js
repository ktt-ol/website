var rooms = {};

rooms["Conference"] = {
	name: "Conference",
	abbreviation: "C",
	bgcolor: "black",
	color: "white"
}

rooms["Laser"] = {
	name: "Laser-Raum",
}

rooms["E-Werkstatt"] = {
	name: "E-Werkstatt",
	abbreviation: "E",
	bgcolor: "yellow",
	color: "black"
}

rooms["Schmutzwerkstatt"] = {
	name: "Schmutzwerkstatt",
}

rooms["3D-Drucker"] = {
	name: "3D-Druckerraum",
	abbreviation: "3D"
}

rooms["Lounge"] = {
	name: "Lounge",
	bgcolor: "red",
	color: "white"

}

rooms["Küche"] = {
	name: "Küche",
}

rooms["Schnittstelle"] = {
	name: "Schnittstelle",
}

rooms["Projektraum"] = {
	name: "Projektraum",
	abbreviation: "Proj.",
}

rooms["Vorstandsbüro"] = {
	name: "Vorstandsbüro",
	abbreviation: "Büro",
}

rooms["Trainspotting Lounge"] = {
	name: "Trainspotting Lounge",
	abbreviation: "Lounge 2",
}

function analyze_location_string(pos) {
	for(key in rooms) {
		if (pos.indexOf(key) !== -1) {
			return rooms[key]
		}
	}
	return null
}
