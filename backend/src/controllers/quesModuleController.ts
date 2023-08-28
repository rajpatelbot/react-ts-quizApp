import { Request, Response } from "express";
import PostQuestions from "../models/postQuestions";
import { postQuestionValidation } from "../validations/postQuestionValidation";
import {
  BAD_REQUEST,
  INTERNAL_SERVER_ERROR,
  INTERNAL_SERVER_ERROR_CODE,
  NO_DATA_FOUND,
  OK,
  QUESTION_POSTED_SUCCESSFULLY,
  SOMETHING_WENT_WRONG,
} from "../constants";
import { IQuestionsModule } from "../types/global.type";
import { IControllerFnReturn } from "./types";

export const postQuestions = async (req: Request, res: Response): IControllerFnReturn => {
  try {
    const payload = req.body as IQuestionsModule;

    const totalPoint = payload.questions.reduce((acc, curr) => acc + curr.point, 0);

    const newQuestion: IQuestionsModule = { ...payload, totalPoint };

    const { error } = postQuestionValidation.validate({ ...newQuestion });
    if (error) {
      return res.status(BAD_REQUEST).json({ message: error.message, success: false });
    }

    const newQuestionModule = new PostQuestions(newQuestion);
    const isPosted = await newQuestionModule.save();
    if (isPosted) {
      return res.status(OK).json({ message: QUESTION_POSTED_SUCCESSFULLY, success: true });
    }

    return res.status(BAD_REQUEST).json({ message: SOMETHING_WENT_WRONG, success: false });
  } catch (error) {
    return res.status(INTERNAL_SERVER_ERROR_CODE).json({ message: INTERNAL_SERVER_ERROR, error, success: false });
  }
};

export const getAllQuestionsModules = async (_: Request, res: Response): IControllerFnReturn => {
  const getAllQuestionsModules = await PostQuestions.find();
  if (getAllQuestionsModules) {
    return res.status(OK).json({ data: getAllQuestionsModules, success: true });
  } else {
    return res.status(BAD_REQUEST).json({ message: SOMETHING_WENT_WRONG, success: false });
  }
};

export const getQuestionsModuleById = async (req: Request, res: Response): IControllerFnReturn => {
  const { id } = req.params;
  const getQuestionsModuleById = await PostQuestions.find({ createdBy: id });
  if (getQuestionsModuleById) {
    return res.status(OK).json({ data: getQuestionsModuleById, success: true });
  } else {
    return res.status(OK).json({ message: NO_DATA_FOUND, success: true });
  }
};

export const deleteQuestionsModuleById = async (req: Request, res: Response): IControllerFnReturn => {
  const { id } = req.params;
  const deleteQuestionsModuleById = await PostQuestions.findByIdAndDelete(id);

  if (deleteQuestionsModuleById) {
    return res.status(OK).json({ message: "Question Module Deleted Successfully", success: true });
  } else {
    return res.status(BAD_REQUEST).json({ message: SOMETHING_WENT_WRONG, success: false });
  }
};
