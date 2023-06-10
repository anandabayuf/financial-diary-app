import AppTitle from '../../../Components/General/AppTitle';
import MainLayout from '../../../Layouts/MainLayout';
import { useState, useEffect } from 'react';
import { getAllUserNotes } from '../../../Api/Notes';
import AppButton from '../../../Components/General/AppButton';
import { BsPlusLg } from 'react-icons/bs';
import { Space, TableProps } from 'antd';
import AppTable from '../../../Components/General/AppTable/index';
import NotesColumns from '../../../Components/Notes/NotesList/NoteColumn';
import AppEmpty from '../../../Components/General/AppEmpty/index';
import AppLoader from '../../../Components/General/AppLoader';
import AppBreadcrumb from '../../../Components/General/AppBreadcrumb';
import { useNavigate } from 'react-router-dom';
import { getRouteNames } from '../../../Utils/RouteUtils';
import RouteNames from '../../../Constants/RouteNames';
import { useAppSelector, useAppDispatch } from '../../../Hooks/useRedux';
import AppSegmented from '../../../Components/General/AppSegmented';
import AppSelect from '../../../Components/General/AppSelect';
import NotesOptionYear from '../../../Components/Notes/NotesList/NoteOptionYear';
import AppText from '../../../Components/General/AppText/index';
import { DataViewTypeNames } from '../../../Constants/DataViewTypeNames';
import NotesGrid from '../../../Components/Notes/NotesList/NoteGrid';
import useLocale from '../../../Hooks/useLocale';
import { errorHandling } from '../../../Api/errorHandling';
import {
	getFullYearFromDate,
	getTwoDigitMonthStringFromDate,
} from '../../../Utils/DateUtils';
import {
	setActiveKeyNoteTab,
	setNoteDataViewType,
	setNotePaginationSize,
	setNoteShowYear,
	setSelectedNote,
} from '../../../Store/Note/NoteSlice';
import { APP_NAME } from '../../../Constants/Constants';
import { appendKey } from '../../../Utils/TableUtils';
import {
	TFetchErrorResponse,
	TNoteResponse,
} from '../../../Api/interfaces/types';

const NotesListPage: React.FC = () => {
	const token = useAppSelector((state) => state.user.accessToken);
	const navigate = useNavigate();
	const dispatch = useAppDispatch();
	const { I18n, language } = useLocale();

	const [notes, setNotes] = useState<TNoteResponse[]>([]);
	const [notesList, setNotesList] = useState<TNoteResponse[]>([]);
	const [optionYear, setOptionYear] = useState<number[]>([]);
	const selectedYear = useAppSelector((state) => state.note.showYear);

	const [isLoading, setIsLoading] = useState<boolean>(false);

	const dataViewType = useAppSelector(
		(state) => state.note.dataViewType?.note
	);
	const pageSize = useAppSelector((state) => state.note.paginationSize?.note);

	useEffect(() => {
		const getNotes = async () => {
			setIsLoading(true);

			if (token) {
				try {
					const res = await getAllUserNotes(token);

					const resNotes = [...res.data.data];
					let years: number[] = [];

					resNotes.forEach((note) => {
						const year = new Date(note.date).getFullYear();

						if (years.length === 0) {
							years = [year];
						} else if (!years.some((value) => value === year)) {
							years.push(year);
						}
					});

					setOptionYear(years);
					setNotes(resNotes);
					setNotesList(resNotes);
				} catch (error) {
					errorHandling(error as TFetchErrorResponse, navigate);
				}
			}

			setIsLoading(false);
		};

		getNotes(); // eslint-disable-next-line
	}, []);

	const handleClickCreate = () => {
		navigate(getRouteNames(RouteNames.CREATE_NOTE));
	};

	const handleChangeDataViewType = (values: DataViewTypeNames) =>
		dispatch(setNoteDataViewType({ note: values }));

	const handleChangeYear = (value: string | number) => {
		// setSelectedYear(value);
		dispatch(setNoteShowYear(value));

		if (value === 'all-year') {
			setNotesList(notes);
		} else {
			let newWalletLists = [...notes];

			newWalletLists = newWalletLists.filter(
				(el) => new Date(el.date).getFullYear() === value
			);

			setNotesList(newWalletLists);
		}
	};

	const handleView = (record: TNoteResponse) => {
		dispatch(
			setSelectedNote({
				id: record._id,
				month: getTwoDigitMonthStringFromDate(record.date),
				year: getFullYearFromDate(record.date).toString(),
			})
		);
		dispatch(setActiveKeyNoteTab('wallet-note-tab'));
		navigate(
			`/notes/${getFullYearFromDate(
				record.date
			)}/${getTwoDigitMonthStringFromDate(record.date)}`
		);
	};

	const pagination: TableProps<TNoteResponse>['pagination'] = {
		pageSize: pageSize,
		onShowSizeChange(current, size) {
			dispatch(
				setNotePaginationSize({
					note: size,
				})
			);
		},
	};

	useEffect(() => {
		document.title = `${I18n.t('notes')} - ${APP_NAME}`;
	}, [I18n, language]);

	return (
		<MainLayout>
			<AppBreadcrumb />
			<div className='flex justify-between items-center mb-5'>
				<AppTitle
					title={I18n.t('notes')!}
					level={5}
				/>
				<AppButton
					type='primary'
					onClick={handleClickCreate}
				>
					<Space>
						<div className='flex justify-center'>
							<BsPlusLg />
						</div>
						{I18n.t('label.create.note')}
					</Space>
				</AppButton>
			</div>
			{isLoading ? (
				<AppLoader isInPage />
			) : notesList.length > 0 ? (
				<>
					<div className='flex justify-end items-center mb-3 gap-x-3'>
						<AppText
							text={`${I18n.t('content.show')}:`}
							className='text-sm max-[425px]:hidden'
						/>
						<AppSelect
							placeholder={I18n.t('placeholder.select_year')}
							value={selectedYear}
							options={NotesOptionYear({
								years: optionYear,
								I18n: I18n,
							})}
							loading={isLoading}
							onChange={handleChangeYear}
						/>
						<AppSegmented
							value={dataViewType}
							handleChange={handleChangeDataViewType}
						/>
					</div>
					{dataViewType === DataViewTypeNames.LIST ? (
						<AppTable
							dataSource={appendKey(notesList)}
							columns={NotesColumns({
								handleView,
								showYear: selectedYear,
								I18n: I18n,
								language: language,
							})}
							pagination={pagination}
						/>
					) : (
						<NotesGrid
							data={notesList}
							showYear={selectedYear}
							handleView={handleView}
							I18n={I18n}
							language={language}
						/>
					)}
				</>
			) : (
				<AppEmpty isInPage />
			)}
		</MainLayout>
	);
};

export default NotesListPage;
