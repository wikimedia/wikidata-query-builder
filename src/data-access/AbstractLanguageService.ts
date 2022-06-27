import LanguageService from '@/data-access/LanguageService';

export default abstract class AbstractLanguageService implements LanguageService {
	public getAppLanguageCode(): string {
		const urlParams = new URLSearchParams( window.location.search );
		if ( urlParams.has( 'uselang' ) ) {
			return urlParams.get( 'uselang' ) as string;
		}
		return 'en';
	}
	public abstract getMessagesForLangCode( code: string ): Promise<{ [key: string]: string}>;
}
