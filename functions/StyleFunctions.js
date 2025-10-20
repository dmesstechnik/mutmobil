export const getTailwindColorForTicketStatus = (statusId) => {
return statusId == 0 ? "#D1D5DB" : statusId == 1 ? '#1c9f41B0' : statusId == 2 ? '#ce8f31A1' : statusId == 3 ? 'cornflowerblue' : statusId == 4 ? "red" : '#D1D5DB';
}