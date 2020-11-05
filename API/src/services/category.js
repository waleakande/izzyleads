import { Container, Service } from 'typedi';

@Service()
export default class CategoryService {
  constructor() {
    this.categoryModel = Container.get('categoryModel');
    this.logger = Container.get('logger');
  }

  async getCategories(skip = 0, limit = 10, fieldPicker) {
    const categories = await this.categoryModel
      .find()
      .skip(skip * limit)
      .limit(limit)
      .populate('subCategories');
    return {
      data: categories,
      limit,
      skip,
      page: skip + 1,
    };
  }

  async createCategory(categoryDTO) {
    const category = new this.categoryModel(categoryDTO);
    await category.save();

    return category;
  }

  async getCategoryByName(categoryName = '') {
    return await this.categoryModel.findOne({
      lowerCaseName: categoryName.toLowerCase(),
    });
  }

  async getHighesDisplayOrder() {
    const result = await this.categoryModel
      .find()
      .select('displayOrder')
      .sort({ displayOrder: -1 })
      .limit(1);
    const highestResult = result[0] || { displayOrder: 0 };
    return highestResult.displayOrder || 0;
  }

  async updateCategory(id, data) {
    return await this.categoryModel
      .findByIdAndUpdate(id, { $set: data }, { new: true })
      .populate('subCategories');
  }

  async getCategory(id) {
    return await this.categoryModel
      .findOne({ _id: id })
      .populate('subCategories');
  }

  async deleteCategory(id) {
    return await this.categoryModel.findByIdAndRemove({ _id: id });
  }

  async getAllCategories() {
    return await this.categoryModel
      .find({ published: true })
      .populate('subCategories')
      .sort('displayOrder');
  }

  pickFieldsForRole(fieldsPicker, data, action) {
    return [];
  }
}
