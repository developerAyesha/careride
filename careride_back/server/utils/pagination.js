function pagination(data, page, perPage) {
  return {
    items: data.slice().splice(page * perPage - perPage, perPage),
    totalPages: Math.ceil(data.length / perPage)
  };
}

module.exports = {
  pagination
};
