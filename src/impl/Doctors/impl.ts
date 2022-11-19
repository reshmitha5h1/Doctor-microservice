import { Api } from "../../../dist/models";
import * as t from "../../../dist/api/doctors/types";
import * as v from "../../../dist/validation";
import { db } from "../../db";

export class DoctorsService {
	private readonly collectionName: string;

	constructor() {
		this.collectionName = "NEW-DOCTORS";
		this.getAll = this.getAll.bind(this);
		this.get = this.get.bind(this);
		this.create = this.create.bind(this);
		this.update = this.update.bind(this);
		this.delete = this.delete.bind(this);
	}

	/* *
	 ! Todo: Implement pagination for this service
	*/
	async getAll(
		limit: number | null | undefined,
		direction: Api.DirectionParamEnum | undefined,
		sortByField: string | null | undefined
	): Promise<t.GetDoctorsGetAllResponse> {
		try {
			const DoctorsQuerySnap = await db.collection(`${this.collectionName}`).get();
			const Doctors: Api.DoctorsDto[] = DoctorsQuerySnap.docs
				.map((doc) => doc.data())
				.map((json) => v.modelApiDoctorsDtoFromJson("Doctors", json));
			return {
				status: 200,
				body: {
					items: Doctors,
					totalCount: Doctors.length,
				},
			};
		} catch (error) {
			console.error(error);
			throw error;
		}
	}

	async get(uId: string): Promise<t.GetDoctorsGetResponse> {
		try {
			const DoctorsDocSnap = await db.doc(`${this.collectionName}/${uId}`).get();
			if (!DoctorsDocSnap.exists) {
				throw new Error("no-Doctors-found");
			}
			const Doctors = v.modelApiDoctorsDtoFromJson("Doctors", DoctorsDocSnap.data());
			return {
				status: 200,
				body: Doctors,
			};
		} catch (error: any) {
			console.error(error);
			if (error.toString().match("no-Doctors-found")) {
				return {
					status: 404,
					body: {
						message: "No Doctor found with given id",
					},
				};
			}
			throw error;
		}
	}

	async create(request: Api.DoctorsDto | undefined): Promise<t.PostDoctorsCreateResponse> {
		try {
			if (!request) {
				throw new Error("invalid-inputs");
			}

			if (!request.uId) {
				throw new Error("no-uId-found");
			}

			const DoctorsRef = db.collection(`${this.collectionName}`).doc(request.uId);
			try {
				await this._checkUserExists(request.uId);
			} catch (error: any) {
				if (error.toString().match("no-Doctors-found")) {
					await DoctorsRef.set({
						...request,
						isExist: true,
						uId: DoctorsRef.id,
						createdAt: new Date().toISOString(),
					});
					return {
						status: 201,
						body: request,
					};
				}
			}
			throw new Error("Doctors-already-exists");
		} catch (error: any) {
			console.error(error);
			if (error.toString().match("invalid-inputs")) {
				return {
					status: 422,
					body: {
						message: "Invalid request",
					},
				};
			}

			if (error.toString().match("invalid-inputs")) {
				return {
					status: 422,
					body: {
						message: "No uid found in request",
					},
				};
			}

			if (error.toString().match("Doctors-already-exists")) {
				return {
					status: 422,
					body: {
						message: "Doctors already exists with given uid",
					},
				};
			}
			throw error;
		}
	}

	async update(request: Api.DoctorsDto | undefined): Promise<t.PutDoctorsUpdateResponse> {
		try {
			if (!request) {
				throw new Error("invalid-inputs");
			}

			if (!request.uId) {
				throw new Error("no-uId-found");
			}

			const DoctorsRef = db.collection(`${this.collectionName}`).doc(request.uId);

			// checking whether Doctors exists or not
			const DoctorsRes = await this._checkUserExists(request.uId);
			await DoctorsRef.update({
				...request,
				updatedAt: new Date().toISOString(),
			});
			return {
				status: 200,
				body: {
					...DoctorsRes,
					...request,
				},
			};
		} catch (error: any) {
			console.error(error);
			if (error.toString().match("invalid-inputs")) {
				return {
					status: 422,
					body: {
						message: "Invalid request",
					},
				};
			}

			if (error.toString().match("invalid-inputs")) {
				return {
					status: 422,
					body: {
						message: "No uid found in request",
					},
				};
			}

			throw error;
		}
	}

	async delete(uId: string): Promise<t.DeleteDoctorsDeleteResponse> {
		try {
			await this._checkUserExists(uId);
			const DoctorsRef = db.collection(`${this.collectionName}`).doc(uId);
			await DoctorsRef.update({
				isExist: false,
				deletedAt: new Date().toISOString(),
			});
			return {
				status: 200,
				body: {
					message: "Doctors deleted successfully",
				},
			};
		} catch (error: any) {
			console.error(error);
			if (error?.response?.status === 404) {
				return {
					status: 404,
					body: {
						message: "Doctor already deleted or no Doctor found",
					},
				};
			}
			throw error;
		}
	}

	private async _checkUserExists(uId: string) {
		const response = await this.get(uId);
		if (response.status === 404) {
			throw new Error("no-Doctors-found");
		}
		return response.body;
	}
}