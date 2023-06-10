import { Col } from 'antd';
import AppCard from '../../Components/General/AppCard';
import FrontLayout from '../../Layouts/FrontLayout';
import LoginIllustration from '../../Assets/Images/Login/login-illustration.jpg';
import LoginForm from '../../Components/Login/LoginForm';
import StyledContainer from './styled/StyledContainer';
import AppButton from '../../Components/General/AppButton';
import AppText from '../../Components/General/AppText';
import StyledRegisterContainer from './styled/StyledRegisterContainer';
import { login } from '../../Api/Auth';
import { useState, useEffect } from 'react';
import { useAppDispatch } from '../../Hooks/useRedux';
import { setUserLoggedIn } from '../../Store/User/UserSlice';
import { decodeJWT, encryptPassword } from '../../Utils/AuthUtils';
import { useNavigate } from 'react-router-dom';
import { getUserById } from '../../Api/User';
import AppTitle from '../../Components/General/AppTitle/index';
import AppLogo from '../../Components/General/AppLogo';
import useLocale from '../../Hooks/useLocale';
import { errorHandling } from '../../Api/errorHandling';
import { APP_NAME } from '../../Constants/Constants';
import { TLoginPayload, TFetchErrorResponse } from '../../Api/interfaces/types';

const LoginPage: React.FC = () => {
	const dispatch = useAppDispatch();
	const navigate = useNavigate();

	const [loading, setLoading] = useState(false);
	const { I18n, language } = useLocale();

	const handleLogin = async (values: TLoginPayload) => {
		setLoading(true);

		try {
			const encryptedPass = encryptPassword(values.password);

			const res = await login({
				username: values.username,
				password: encryptedPass,
			});

			const jwtDecoded = decodeJWT(res.data.data);

			try {
				const responseGetUser = await getUserById(
					jwtDecoded.id,
					res.data.data
				);

				const user = responseGetUser.data.data;

				dispatch(
					setUserLoggedIn({
						accessToken: res.data.data,
						data: await user,
					})
				);
			} catch (error) {
				errorHandling(error as TFetchErrorResponse, navigate);
			}
		} catch (error) {
			errorHandling(error as TFetchErrorResponse, navigate);
		}

		setLoading(false);
	};

	const handleClickRegister = () => {
		navigate('/register');
	};

	useEffect(() => {
		document.title = `${I18n.t('login')} - ${APP_NAME}`;
	}, [language, I18n]);

	return (
		<FrontLayout>
			<AppCard>
				<StyledContainer
					justify={'center'}
					align={'middle'}
					gutter={[24, 0]}
				>
					<Col className='illustration-container'>
						<img
							src={LoginIllustration}
							alt='login-illustration'
							width='500px'
							className='rounded-lg'
						/>
					</Col>
					<Col className='login-form-container'>
						<div className='min-[426px]:hidden flex justify-center mb-3'>
							<AppLogo width='128px' />
						</div>
						<div className='flex justify-between items-baseline mb-5'>
							<AppTitle
								level={4}
								title={I18n.t('login')!}
							/>
							<div className='max-[425px]:hidden'>
								<AppLogo width='128px' />
							</div>
						</div>
						<LoginForm
							handleFinish={handleLogin}
							loading={loading}
						/>
						<StyledRegisterContainer>
							<AppText
								text={I18n.t('content.dont_have_an_account?')}
								className='text-xs'
							/>
							<AppButton
								type='link'
								onClick={handleClickRegister}
							>
								{I18n.t('register')}
							</AppButton>
						</StyledRegisterContainer>
					</Col>
				</StyledContainer>
			</AppCard>
		</FrontLayout>
	);
};

export default LoginPage;
