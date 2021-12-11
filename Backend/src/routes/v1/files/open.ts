import { FastifyRequest, FastifyReply } from "fastify";
import fileMapping from "../../../db/models/fileMapping";
import auth from "../../../utils/auth";
import filesystem from "../../../utils/filesystem";

export default (
	req: FastifyRequest<{ Params: { file: string } }>,
	res: FastifyReply
) => {
	auth(req).then((user) => {
		if (user) {
			if (typeof req.params.file === "string") {
				fileMapping
					.findOne({
						filePath: req.params.file,
					})
					.then((file) => {
						if (file) {
							filesystem
								.readUserFile(user._id, user.name, file.filePath)
								.then((data) => {
									res.header("content-type", file.mimeType).send(data);
								});
						} else {
							res.status(404).send({ ok: false, error: "File not found" });
						}
					});
			} else {
				res.status(400).send({ ok: false, error: "No file specified" });
			}
		} else {
			res.code(401).send({
				error: "Unauthorized",
				ok: false,
			});
		}
	});
};
