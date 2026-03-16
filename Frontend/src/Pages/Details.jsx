import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import CameraCapture from "../Components/CameraCapture";
import SignatureCanvas from "../Components/SignatureCanvas";
import { useEmployees } from "../Context/EmployeeContext";
import { mergeImages } from "../utils/mergeImage";

export default function Details() {
	const { employeeId } = useParams();
	const navigate = useNavigate();
	const { audits, getEmployeeById, saveAuditImage } = useEmployees();
	const employee = getEmployeeById(employeeId);
	const existingAudit = audits[employeeId];
	const [photoState, setPhotoState] = useState(null);
	const [signature, setSignature] = useState(existingAudit?.signatureDataUrl ?? "");
	const [isMerging, setIsMerging] = useState(false);
	const [mergeError, setMergeError] = useState("");

	const overlayDimensions = useMemo(() => {
		if (!photoState) {
			return { width: 960, height: 540 };
		}

		return photoState;
	}, [photoState]);

	if (!employee) {
		return (
			<div className="min-h-screen bg-slate-100 px-4 py-8">
				<div className="mx-auto max-w-3xl rounded-3xl bg-white p-6 shadow-lg">
					<h1 className="text-2xl font-semibold text-slate-900">Employee not found</h1>
					<p className="mt-2 text-slate-500">The requested employee record is not available in the current dataset.</p>
					<Link className="mt-6 inline-flex rounded-lg bg-slate-900 px-4 py-2 text-white" to="/list">
						Return to Directory
					</Link>
				</div>
			</div>
		);
	}

	const handleMerge = async () => {
		if (!photoState?.photoDataUrl || !signature) {
			setMergeError("Capture a photo and add a signature before merging.");
			return;
		}

		setIsMerging(true);
		setMergeError("");

		try {
			const merged = await mergeImages(photoState.photoDataUrl, signature);
			saveAuditImage(employeeId, {
				name: employee.name,
				city: employee.city,
				department: employee.department,
				photoDataUrl: photoState.photoDataUrl,
				signatureDataUrl: signature,
				mergedDataUrl: merged.dataUrl,
				mergedSize: merged.blob.size
			});
			navigate("/analytics");
		} catch {
			setMergeError("The photo and signature could not be merged.");
		} finally {
			setIsMerging(false);
		}
	};

	return (
		<div className="min-h-screen bg-[linear-gradient(180deg,_#f8fafc_0%,_#e2e8f0_100%)] px-4 py-8">
			<div className="mx-auto max-w-7xl rounded-[28px] bg-white/95 p-6 shadow-[0_30px_80px_rgba(15,23,42,0.12)] backdrop-blur">
				<div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
					<div>
						<p className="text-sm text-slate-500">Employee ID #{employeeId}</p>
						<h1 className="text-3xl font-semibold text-slate-900">Identity Verification</h1>
						<p className="mt-1 text-sm text-slate-500">Capture the profile photo, sign directly on top of it, then merge both layers into the final audit image.</p>
					</div>
					<Link className="rounded-lg border border-slate-300 px-4 py-2" to="/list">
						Back to Directory
					</Link>
				</div>

				<div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
					<div className="space-y-4 rounded-3xl bg-slate-50 p-5">
						<div>
							<h2 className="text-lg font-semibold text-slate-900">Profile</h2>
							<p className="mt-2 text-sm text-slate-600">{employee.name}</p>
							<p className="text-sm text-slate-500">{employee.department}</p>
						</div>

						<div className="space-y-2 rounded-2xl bg-white p-4">
							<p className="text-sm text-slate-500">City</p>
							<p className="font-medium text-slate-900">{employee.city}</p>
							<p className="text-sm text-slate-500">Salary</p>
							<p className="font-medium text-slate-900">₹{employee.salary.toLocaleString("en-IN")}</p>
						</div>

						<CameraCapture
							onCapture={({ photoDataUrl, width, height }) => {
								setPhotoState({ photoDataUrl, width, height });
								setSignature("");
							}}
						/>
					</div>

					<div className="space-y-4 rounded-3xl bg-slate-50 p-5">
						<div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
							<div>
								<h2 className="text-lg font-semibold text-slate-900">Audit Canvas</h2>
								<p className="text-sm text-slate-500">Use mouse or touch to sign over the captured image.</p>
							</div>
							<button
								type="button"
								onClick={handleMerge}
								disabled={isMerging}
								className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
							>
								{isMerging ? "Merging..." : "Merge Audit Image"}
							</button>
						</div>

						{photoState ? (
							<div className="space-y-3">
								<div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-950">
									<img src={photoState.photoDataUrl} alt={`${employee.name} capture`} className="w-full rounded-2xl" />
									<SignatureCanvas width={overlayDimensions.width} height={overlayDimensions.height} onChange={setSignature} />
								</div>
								<p className="text-sm text-slate-500">Merged output will be stored in the analytics screen for this employee.</p>
							</div>
						) : (
							<div className="rounded-2xl border border-dashed border-slate-300 p-12 text-center text-sm text-slate-500">
								Capture a profile photo to enable the signature overlay.
							</div>
						)}

						{mergeError ? <p className="text-sm text-rose-600">{mergeError}</p> : null}
						{existingAudit?.mergedDataUrl ? (
							<div className="rounded-2xl bg-white p-4">
								<p className="text-sm font-medium text-slate-900">Existing merged audit</p>
								<img src={existingAudit.mergedDataUrl} alt="Existing audit" className="mt-3 rounded-2xl border border-slate-200" />
							</div>
						) : null}
					</div>
				</div>
			</div>
		</div>
	);
}
