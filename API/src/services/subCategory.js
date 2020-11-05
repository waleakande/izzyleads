import { Container, Service } from 'typedi';
import subCategory from '../models/subCategory';

@Service()
export default class SubCategoryService {
  constructor() {
    this.subCategoryModel = Container.get('subCategoryModel');
    this.logger = Container.get('logger');
  }

  async getSubCategories(categoryId, skip = 0, limit = 10) {
    const subCategories = await this.subCategoryModel
      .find({ category: categoryId })
      .skip(skip * limit)
      .limit(limit)
      .populate('category');

    return {
      data: subCategories,
      limit,
      skip,
      page: skip + 1,
    };
  }

  async createSubCategory(subCategoryDTO) {
    const subCategory = new this.subCategoryModel(subCategoryDTO);
    await subCategory.save();

    return subCategory;
  }

  async getSubCategoryByName(categoryId, subCategoryName = '') {
    return await this.subCategoryModel.findOne({
      category: categoryId,
      lowerCaseName: subCategoryName.toLowerCase(),
    });
  }

  async getSubCategory(categoryId, subCategoryId) {
    return await this.subCategoryModel
      .findOne({ _id: subCategoryId, category: categoryId })
      .populate('category');
  }

  async getHighesDisplayOrder(categoryId) {
    const result = await this.subCategoryModel
      .find({ category: categoryId })
      .select('displayOrder')
      .sort({ displayOrder: -1 })
      .limit(1);
    const highestResult = result[0] || { displayOrder: 0 };
    return highestResult.displayOrder || 0;
  }

  async updateSubCategory(subCategoryId, data) {
    return await this.subCategoryModel
      .findByIdAndUpdate(subCategoryId, { $set: data }, { new: true })
      .populate('subCategories');
  }

  async deleteCategory(id) {
    return await this.subCategoryModel.findByIdAndRemove({ _id: id });
  }

  pickFieldsForRole(fieldsPicker, data, action) {
    return [];
  }
}
