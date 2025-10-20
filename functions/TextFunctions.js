export const getTicketStatusNames = (statusId) => {
    return statusId == 0 ? "Offen" : statusId == 1 ? 'Erledigt' : statusId == 2 ? 'Teil. Erledigt' : statusId == 3 ? 'Nicht zu hause' : statusId == 4 ? "Nicht erledigt" : 'Offen';
}

export const getTicketStatusTitles = () => {
    return ["Offen", "Erledigt", "Teil. Erledigt", "Nicht zu hause", "Nicht erledigt"];
}

export const getTicketStatusId = (statusName) => {
    switch (statusName) {
        case "Offen":
            return 0;
        case "Erledigt":
            return 1;
        case "Teil. Erledigt":
            return 2;
        case "Nicht zu hause":
            return 3;
        case "Nicht erledigt":
            return 4;
        default:
            return null;
    }
}