import { DoctorsApi } from "../../dist/api/doctors/types";
import { ApiImplementation } from "../../dist/types";
import { DoctorsServiceImpl } from "./Doctors";

export class ServiceImplementation implements ApiImplementation {
	doctors: DoctorsApi = DoctorsServiceImpl;
}
