import { DetailNoteTabProps } from './interfaces/interfaces';
import { useState, useEffect, ChangeEventHandler } from 'react';
import { getAllUserWalletNote } from '../../../../Api/Wallet-Note';
import { useAppSelector, useAppDispatch } from '../../../../Hooks/useRedux';
import AppModal from '../../../General/AppModal';
import withWalletNoteForm from '../DetailNoteForm/withWalletNoteForm';
import DetailNoteForm from '../DetailNoteForm/index';
import AppTitle from '../../../General/AppTitle';
import { toURLFormat } from '../../../../Utils/UrlUtils';
import {
	setNoteDataViewType,
	setNotePaginationSize,
	setSelectedWalletNote,
} from '../../../../Store/Note/NoteSlice';
import { useNavigate } from 'react-router-dom';
import { TableProps } from 'antd';
import { errorHandling } from '../../../../Api/errorHandling';
import {
	TFetchErrorResponse,
	TWalletNoteResponse,
} from '../../../../Api/interfaces/types';
import { DataViewTypeNames } from '../../../../Constants/DataViewTypeNames';

const withWalletNoteTab = (
	Component: React.ComponentType<DetailNoteTabProps>
) => {
	const NewComponent: React.FC<DetailNoteTabProps> = ({
		noteId,
		I18n,
		...rest
	}) => {
		const token = useAppSelector((state) => state.user.accessToken);
		const dispatch = useAppDispatch();
		const navigate = useNavigate();
		// const location = useLocation();

		const dataViewType = useAppSelector(
			(state) => state.note.dataViewType?.wallet
		);
		const pageSize = useAppSelector(
			(state) => state.note.paginationSize?.wallet
		);

		const [walletNote, setWalletNote] = useState<TWalletNoteResponse[]>([]);
		const [walletNoteList, setWalletNoteList] = useState<
			TWalletNoteResponse[]
		>([]);

		const [isLoading, setIsLoading] = useState<boolean>(false);
		const [isSearching, setIsSearching] = useState<boolean>(false);
		const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

		useEffect(() => {
			const getWalletNote = async () => {
				setIsLoading(true);

				if (token && noteId) {
					try {
						const res = await getAllUserWalletNote(token, noteId);

						const data = res.data.data.map((el, index: number) => {
							return {
								...el,
								key: index,
							};
						});
						setWalletNote(data);
						setWalletNoteList(data);
					} catch (error) {
						errorHandling(error as TFetchErrorResponse, navigate);
					}
				}

				setIsLoading(false);
			};

			if (!isModalOpen) {
				getWalletNote();
			} // eslint-disable-next-line
		}, [isModalOpen, token, noteId]);

		const handleChangeDataViewType = (values: DataViewTypeNames) =>
			dispatch(setNoteDataViewType({ wallet: values }));

		const handleClickAdd = () => setIsModalOpen(true);

		const handleClickView = (record: TWalletNoteResponse) => {
			dispatch(
				setSelectedWalletNote({
					id: record._id,
					name: record.wallet.name,
				})
			);
			navigate(`${toURLFormat(record.wallet.name)}`);
		};

		const handleChangeSearch: ChangeEventHandler<HTMLInputElement> = (
			e
		) => {
			if (e.target.value === '') {
				setWalletNoteList(walletNote);
			}
		};

		const handleSearch = (value: string) => {
			if (value) {
				const searchQuery = value.trim();

				if (searchQuery !== '' && searchQuery !== ' ') {
					setIsSearching(true);
					const regex = new RegExp(`${searchQuery}`, 'gi');
					setWalletNoteList(
						walletNote.filter((walletNote) =>
							walletNote.wallet.name.match(regex)
						)
					);
					setIsSearching(false);
				}
			}
		};

		const handleCancelAdd = () => setIsModalOpen(false);

		const WalletNoteForm = withWalletNoteForm(DetailNoteForm);

		const ModalAdd = (
			<AppModal
				title={
					<AppTitle
						title={I18n?.t('title.note.detail.wallet_tab.create')}
						level={4}
					/>
				}
				open={isModalOpen}
			>
				<WalletNoteForm
					noteId={noteId}
					handleCancel={handleCancelAdd}
					I18n={I18n}
				/>
			</AppModal>
		);

		const pagination: TableProps<TWalletNoteResponse>['pagination'] = {
			pageSize: pageSize,
			onShowSizeChange(current, size) {
				dispatch(setNotePaginationSize({ wallet: size }));
			},
		};

		return (
			<Component
				isWallet
				data={walletNote}
				dataList={walletNoteList}
				isLoading={isLoading}
				isSearching={isSearching}
				dataViewType={dataViewType}
				modalAdd={ModalAdd}
				pagination={pagination}
				I18n={I18n}
				handleClickAdd={handleClickAdd}
				handleClickView={handleClickView}
				handleChangeDataViewType={handleChangeDataViewType}
				handleChangeSearch={handleChangeSearch}
				handleSearch={handleSearch}
				{...rest}
			/>
		);
	};

	return NewComponent;
};

export default withWalletNoteTab;
