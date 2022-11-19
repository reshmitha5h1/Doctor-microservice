import { DoctorsService } from "./impl";
import * as t from "../../../dist/api/doctors/types";

const service = new DoctorsService();

export const DoctorsServiceImpl: t.DoctorsApi = {
	postDoctorsCreate: service.create,
	deleteDoctorsDelete: service.delete,
	getDoctorsGet: service.get,
	getDoctorsGetAll: service.getAll,
	putDoctorsUpdate: service.update,
};