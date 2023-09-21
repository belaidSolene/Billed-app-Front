export const formatDate = (dateStr) => {
  const date = new Date(dateStr)
  const ye = new Intl.DateTimeFormat('fr', { year: 'numeric' }).format(date)
  const mo = new Intl.DateTimeFormat('fr', { month: 'short' }).format(date)
  const da = new Intl.DateTimeFormat('fr', { day: '2-digit' }).format(date)
  const month = mo.charAt(0).toUpperCase() + mo.slice(1)
  return `${parseInt(da)} ${month.substr(0,3)}. ${ye.toString().substr(2,4)}`
}
 
export const formatStatus = (status) => {
  switch (status) {
    case "pending":
      return "En attente"
    case "accepted":
      return "Accepté"
    case "refused":
      return "Refused"
  }
}

export const convertDateWithAbbreviatedMonth = (dateString) => {
  const monthAbbreviations = [
    'Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jui',
    'Jui', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'
  ];

  const [day, monthAbbr, year] = dateString.split(' ');
  const monthIndex = monthAbbreviations.indexOf(monthAbbr.replace('.', ''));

  if (monthIndex === -1) {
    throw new Error('Mois abrégé non reconnu');
  }

  return new Date(`${monthIndex + 1}/${day}/${year}`);
}