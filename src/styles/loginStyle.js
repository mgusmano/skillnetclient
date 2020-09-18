import { isMobile } from '../helper/resolutionHelper';

function getLoginPageStyle() {
    const cssInfo = {
        root: {
            display: 'flex',
            paddingTop: '14%',
        },

        paper_box: {
            width: '100%',
            height: '100%',
        },

        paper_form: {
            padding: 40,
            borderRadius: 8,
            width: '100%',
            height: '100%',
        },

        login_btn: {
            textTransform: 'capitalize',
            borderRadius: 4,
            border: 0,
            height: 50,
            width: '100%',
            fontSize: 18,
        },

        headText: {
            color: '#333',
            fontSize: 20,
            fontWeight: 600,
            marginBottom: 20,
        },

        logo_image: {
            width: 250,
        },

        error_msg: {
            marginTop: 8,
            marginBottom: -10,
        },

        text_field: {
            width: '100%',
            marginBottom: 24,
        },

        button_div: {
            marginTop: 16,
        },
        textValue: {
            fontWeight: 600,
        },
    };

    if (isMobile(window.screen.width)) {
        cssInfo.login_btn.padding = '0 90px';
        cssInfo.root.marginTop = '10%';
    }

    return cssInfo;
}

export default getLoginPageStyle();
