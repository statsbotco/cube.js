import { Dropdown } from 'antd';

import { Button } from '../components';

const ButtonDropdown = ({ overlay, disabled, ...buttonProps }) => {
  return (
    <Dropdown
      disabled={disabled}
      overlay={overlay}
      placement="bottomLeft"
      trigger={['click']}
    >
      <Button {...buttonProps} disabled={disabled} data-iddd={111} />
    </Dropdown>
  );
};

export default ButtonDropdown;