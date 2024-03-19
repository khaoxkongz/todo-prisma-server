const formatDate = (date: Date) => {
  const options: Intl.DateTimeFormatOptions = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
  };
  const formatter = new Intl.DateTimeFormat("en-US", options);
  return formatter.format(date);
};

export { formatDate };
