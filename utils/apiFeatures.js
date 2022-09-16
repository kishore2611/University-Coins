class ApiFeatures {
  constructor(query, queryStr) {
    this.query = query;
    this.queryStr = queryStr;
  }
  // search() {
  //   const keyword = this.queryStr.keyword
  //     ? {
  //         jobTitle: {
  //           $regex: this.queryStr.keyword,
  //           $options: "i",
  //         },
  //       }
  //     : {};

  //   // console.log(keyword);
  //   this.query = this.query.find({ ...keyword });
  //   return this;
  // }

  filter() {
    const queryCopy = { ...this.queryStr };
    // console.log(queryCopy);

    //REMOVE SOME FIELD FOR CATEGORY
    const removefield = ["keyword", "page", "limit"];

    removefield.forEach((key) => delete queryCopy[key]);

    //Filter for Price and rating
    // console.log(queryCopy);

    let queryStr = JSON.stringify(queryCopy);
    const regex = /\b(gt|gte|lt|lte|in)\b/g;
    const REGEXP = /^$/;

    // console.log(regex);
    queryStr = queryStr.replace(regex, (key) => `$${key}`);
    queryStr = queryStr.replace(REGEXP);

    this.query = this.query.find(JSON.parse(queryStr));

    // console.log(queryStr);
    return this;
  }

  // pagination(resultPerPage) {
  //   const currentPage = Number(this.queryStr.page) || 1;

  //   const skip = resultPerPage * (currentPage - 1);

  //   this.query = this.query.limit(resultPerPage).skip(skip);

  //   return this;
  // }
}

module.exports = ApiFeatures;
