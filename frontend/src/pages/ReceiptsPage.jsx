import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { receiptService } from "../services";
import TransactionModal from "../components/TransactionModal";
import { toast, Bounce } from "react-toastify";

const ReceiptsPage = () => {
	const [isMobile, setIsMobile] = useState(window.innerWidth <= 767);
	const [file, setFile] = useState(null);
	const [uploading, setUploading] = useState(false);
	const [receiptResult, setReceiptResult] = useState(null);
	const [error, setError] = useState("");
	const navigate = useNavigate();

	const [openEditReceiptResult, setOpenEditReceiptResult] = useState(false);
	const [categories, setCategories] = useState([]);
	const [isSaving, setIsSaving] = useState(false);

	// Fetch categories when component mounts
	useEffect(() => {
		const fetchCategories = async () => {
			try {
				const data = await receiptService.getCategories();
				setCategories(data || []);
			} catch (error) {
				console.error("Failed to fetch categories:", error);
			}
		};

		fetchCategories();
	}, []);

	// Handle mobile responsive resize
	useEffect(() => {
		const handleResize = () => {
			setIsMobile(window.innerWidth <= 767);
		};
		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, []);

	const handleFileChange = (e) => {
		setFile(e.target.files[0]);
		setReceiptResult(null);
		setError("");
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!file) {
			setError("Please select a file to upload.");
			return;
		}

		const formData = new FormData();
		formData.append("receipt", file);

		try {
			setUploading(true);
			setError("");
			const data = await receiptService.uploadReceipt(formData);
			setReceiptResult(data);

			// Open the modal to allow user to edit the extracted data
			setOpenEditReceiptResult(true);
		} catch (err) {
			setError("Upload failed. Please try again.");
			console.error(err);
		} finally {
			setUploading(false);
		}
	};

	const handleEditReceiptSubmit = (formData) => {
		// Update the receiptResult with the edited data
		const updatedReceiptResult = {
			...receiptResult,
			extractedData: {
				merchant: formData.name,
				amount: parseFloat(formData.cost) || 0,
				category: formData.category,
				date: formData.addedOn,
				isIncome: formData.isIncome,
			},
		};

		setReceiptResult(updatedReceiptResult);
		setOpenEditReceiptResult(false);
	};

	// Handle final save to database (second verification step)
	const handleFinalSave = async () => {
		try {
			setIsSaving(true);

			const transactionData = {
				name: receiptResult.extractedData.merchant,
				category: receiptResult.extractedData.category,
				cost: receiptResult.extractedData.amount,
				addedOn: receiptResult.extractedData.date,
				isIncome: receiptResult.extractedData.isIncome || false,
			};

			await receiptService.saveReceiptTransaction({
				receiptId: receiptResult._id,
				transactionData: transactionData,
			});

			toast.success("Transaction saved successfully!", {
				position: "top-right",
				autoClose: 3000,
				hideProgressBar: false,
				closeOnClick: false,
				pauseOnHover: true,
				draggable: true,
				progress: undefined,
				style: {
					fontSize: "18px",
					padding: "16px 24px",
					minWidth: "500px",
				},
				theme: "light",
				transition: Bounce,
			});

			setTimeout(() => navigate("/dashboard"), 1000);
		} catch (err) {
			setError("Failed to save transaction. Please try again.");
			console.error(err);
		} finally {
			setIsSaving(false);
		}
	};

	// Handle edit button in result div
	const handleEditResult = () => {
		setOpenEditReceiptResult(true);
	};

	const handleNewCategory = (newCategory, isIncome) => {
		setCategories((prev) =>
			[...prev, { name: newCategory, isIncome }].sort((a, b) =>
				a.name.localeCompare(b.name)
			)
		);
	};

	return (
		<>
			<h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
				Upload Receipt
			</h1>
			<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
				<div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
					<form onSubmit={handleSubmit}>
						<label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
							Select a receipt file (JPG, PNG, PDF)
						</label>
						<input
							type="file"
							onChange={handleFileChange}
							className="block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 dark:file:bg-blue-900/50 file:text-blue-700 dark:file:text-blue-300 hover:file:bg-blue-100 dark:hover:file:bg-blue-800"
							accept=".jpeg,.jpg,.png,.pdf"
						/>
						<button
							type="submit"
							disabled={uploading}
							className="mt-4 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300">
							{uploading
								? "Processing..."
								: "Upload & Extract Data"}
						</button>
						{error && (
							<p className="mt-2 text-sm text-red-600">{error}</p>
						)}
					</form>
				</div>

				<div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
					<h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">
						Last Upload Result
					</h2>
					{receiptResult ? (
						<div>
							<div className="mb-4">
								<p className="text-gray-700 dark:text-gray-300">
									<strong>Merchant:</strong>{" "}
									{receiptResult.extractedData.merchant}
								</p>
								<p className="text-gray-700 dark:text-gray-300">
									<strong>Amount:</strong>{" "}
									{(
										parseFloat(
											receiptResult.extractedData.amount
										) || 0
									).toFixed(2)}
								</p>
								<p className="text-gray-700 dark:text-gray-300">
									<strong>Category:</strong>{" "}
									{receiptResult.extractedData.category}
								</p>
								<p className="text-gray-700 dark:text-gray-300">
									<strong>Date:</strong>{" "}
									{new Date(
										receiptResult.extractedData.date
									).toLocaleDateString()}
								</p>
								{receiptResult.extractedData.isIncome && (
									<p className="text-gray-700 dark:text-gray-300">
										<strong>Income:</strong> Yes
									</p>
								)}
							</div>

							<div className="flex gap-3 mb-4">
								<button
									onClick={handleEditResult}
									disabled={isSaving}
									className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 disabled:bg-yellow-300 text-white rounded-lg font-medium">
									Edit
								</button>
								<button
									onClick={handleFinalSave}
									disabled={isSaving}
									className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white rounded-lg font-medium">
									{isSaving
										? "Saving..."
										: "Save Transaction"}
								</button>
							</div>

							<img
								src={`${import.meta.env.VITE_API_URL?.replace(
									"/api",
									""
								)}${receiptResult.fileUrl}`}
								alt="Uploaded Receipt"
								className="mt-4 rounded-lg max-w-full h-auto"
							/>
						</div>
					) : (
						<p className="text-gray-500 dark:text-gray-400">
							Upload a receipt to see the extracted data here.
						</p>
					)}
				</div>
			</div>

			{isMobile && (
				<button
					onClick={() => navigate("/dashboard")}
					className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 w-full">
					Go to Dashboard
				</button>
			)}

			{/* Transaction Modal for editing receipt data */}
			{openEditReceiptResult && receiptResult && (
				<TransactionModal
					isOpen={openEditReceiptResult}
					onClose={() => {
						setOpenEditReceiptResult(false);
					}}
					onSubmit={handleEditReceiptSubmit}
					transaction={{
						name: receiptResult.extractedData.merchant || "",
						category: receiptResult.extractedData.category || "",
						cost: receiptResult.extractedData.amount || 0,
						addedOn:
							receiptResult.extractedData.date ||
							new Date().toISOString().split("T")[0],
						isIncome: receiptResult.extractedData.isIncome || false,
					}}
					expenseCategories={categories
						.filter((cat) => !cat.isIncome)
						.map((cat) => cat.name || cat)}
					incomeCategories={categories
						.filter((cat) => cat.isIncome)
						.map((cat) => cat.name || cat)}
					onNewCategory={handleNewCategory}
				/>
			)}
		</>
	);
};

export default ReceiptsPage;
